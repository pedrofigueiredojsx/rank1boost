"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/auth";
import { COMMISSION_BPS } from "@/lib/constants";
import { calcOrderPrice } from "@/lib/pricing";
import { canTakeOrder, type BoosterTierName } from "@/lib/tiers";
import { orderInputSchema } from "@/lib/validation";
import { optBool, optInt, optStr, str, type FormState } from "@/lib/form";
import { OrderError, transitionOrder } from "@/lib/order-state";
import { actorOf, getOrderOr404 } from "@/lib/orders";
import { confirmPaymentReceived, fakePaymentsAllowed } from "@/lib/payments/payment-service";
import { markPayoutSent, preparePayout, sendPayout } from "@/lib/payments/payout";
import type { OrderStatus } from "@/generated/prisma/client";

function back(orderId: string, error?: string): never {
  revalidatePath(`/orders/${orderId}`);
  redirect(error ? `/orders/${orderId}?error=${encodeURIComponent(error)}` : `/orders/${orderId}`);
}

// ───────────── Cliente cria o pedido ─────────────

export async function createOrder(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireRole("CLIENT");

  const parsed = orderInputSchema.safeParse({
    serviceId: str(fd, "serviceId"),
    requestedTier: str(fd, "requestedTier") || "STANDARD",
    profileUrl: str(fd, "profileUrl"),
    wowClass: str(fd, "wowClass"),
    spec: str(fd, "spec"),
    currentRating: optInt(fd, "currentRating"),
    targetRating: optInt(fd, "targetRating"),
    hours: optInt(fd, "hours"),
    hasSeasonGear: optBool(fd, "hasSeasonGear"),
    notes: optStr(fd, "notes"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const input = parsed.data;

  const service = await prisma.service.findFirst({ where: { id: input.serviceId, active: true } });
  if (!service) return { error: "Serviço indisponível." };

  // Regras que dependem do tipo de preço do serviço (só sabemos depois de buscar no banco).
  if (service.pricingModel === "PER_RATING" && (input.currentRating == null || input.targetRating == null)) {
    return { fieldErrors: { targetRating: ["Informe o rating atual e o desejado"] } };
  }
  if (service.pricingModel === "PER_HOUR" && !input.hours) {
    return { fieldErrors: { hours: ["Informe quantas horas"] } };
  }

  let priceCents: number;
  try {
    priceCents = calcOrderPrice({
      pricingModel: service.pricingModel,
      basePriceCents: service.priceCents,
      currentRating: input.currentRating,
      targetRating: input.targetRating,
      hours: input.hours,
      tier: input.requestedTier,
      hasSeasonGear: input.hasSeasonGear,
      noGearSurchargeBps: service.noGearSurchargeBps,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível calcular o preço." };
  }

  const usesRating = service.pricingModel === "PER_RATING";
  const usesHours = service.pricingModel === "PER_HOUR";

  const order = await prisma.order.create({
    data: {
      clientId: user.id,
      serviceId: service.id,
      priceCents,
      currency: service.currency,
      commissionBps: COMMISSION_BPS,
      profileUrl: input.profileUrl,
      wowClass: input.wowClass,
      spec: input.spec,
      requestedTier: input.requestedTier,
      currentRating: usesRating || usesHours ? (input.currentRating ?? null) : null,
      targetRating: usesRating ? (input.targetRating ?? null) : null,
      hours: usesHours ? (input.hours ?? null) : null,
      hasSeasonGear: input.hasSeasonGear,
      notes: input.notes ?? null,
      statusEvents: { create: { fromStatus: null, toStatus: "PENDING_PAYMENT", actorId: user.id } },
    },
  });

  redirect(`/orders/${order.id}`);
}

// ───────────── Mudanças de status (cliente, booster, admin) ─────────────

// Status que podem ser pedidos por este caminho genérico.
// ASSIGNED, pagamento e repasse têm ações próprias.
const GENERIC_TARGETS: OrderStatus[] = [
  "IN_PROGRESS",
  "COMPLETED_BY_BOOSTER",
  "CONFIRMED_BY_CLIENT",
  "DISPUTED",
  "CANCELLED",
  "AWAITING_BOOSTER",
];

export async function changeStatus(orderId: string, to: OrderStatus) {
  const user = await requireUser();
  const order = await getOrderOr404(orderId);
  const actor = actorOf(user, order);

  if (!actor || !GENERIC_TARGETS.includes(to)) back(orderId, "Ação não permitida.");
  // Desatribuir só vale para pedido já atribuído (não pode "pular" o pagamento).
  if (to === "AWAITING_BOOSTER" && order.status !== "ASSIGNED") back(orderId, "Ação não permitida.");

  try {
    await transitionOrder({ orderId, to, actor, actorId: user.id });

    if (to === "CONFIRMED_BY_CLIENT") {
      // Cliente confirmou: prepara o repasse ao booster.
      const payout = await preparePayout(orderId);
      try {
        await sendPayout(payout.id); // TODO(você): implementar o envio pelo PayPal
      } catch (e) {
        console.error("[payout] falha ao enviar, fica PENDING para nova tentativa", e);
      }
    }
  } catch (e) {
    back(orderId, e instanceof OrderError ? e.message : "Erro inesperado.");
  }
  back(orderId);
}

// ───────────── Booster se candidata, admin atribui ─────────────

export async function applyToOrder(orderId: string, fd: FormData) {
  const user = await requireRole("BOOSTER");
  const profile = user.boosterProfile;
  const order = await getOrderOr404(orderId);

  if (!profile || profile.status !== "APPROVED") back(orderId, "Seu perfil de booster ainda não foi aprovado.");
  if (order.status !== "AWAITING_BOOSTER") back(orderId, "Este pedido não está aberto.");
  if (!canTakeOrder(profile.tier as BoosterTierName, order.requestedTier as BoosterTierName)) {
    back(orderId, "Seu nível é menor que o exigido neste pedido.");
  }

  const message = optStr(fd, "message")?.slice(0, 300);
  await prisma.orderApplication.upsert({
    where: { orderId_boosterId: { orderId, boosterId: user.id } },
    create: { orderId, boosterId: user.id, message },
    update: { message },
  });
  back(orderId);
}

export async function assignBooster(orderId: string, fd: FormData) {
  const admin = await requireRole("ADMIN");
  const boosterId = str(fd, "boosterId");

  const application = await prisma.orderApplication.findUnique({
    where: { orderId_boosterId: { orderId, boosterId } },
    include: { booster: { include: { boosterProfile: true } }, order: true },
  });
  if (!application || application.booster.boosterProfile?.status !== "APPROVED") {
    back(orderId, "Candidatura inválida.");
  }
  if (!canTakeOrder(application.booster.boosterProfile!.tier as BoosterTierName, application.order.requestedTier as BoosterTierName)) {
    back(orderId, "O nível do booster é menor que o exigido.");
  }

  try {
    await transitionOrder({ orderId, to: "ASSIGNED", actor: "ADMIN", actorId: admin.id, boosterId });
  } catch (e) {
    back(orderId, e instanceof OrderError ? e.message : "Erro inesperado.");
  }
  back(orderId);
}

// ───────────── Atalhos SÓ para desenvolvimento ─────────────
// Servem para você testar o fluxo inteiro antes de implementar pagamento e repasse.
// Ficam desligados em produção e se ALLOW_FAKE_PAYMENTS não for "true".

export async function simulatePayment(orderId: string) {
  const user = await requireUser();
  const order = await getOrderOr404(orderId);
  const actor = actorOf(user, order);

  if (!fakePaymentsAllowed()) back(orderId, "Pagamento simulado desligado.");
  if (actor !== "CLIENT" && actor !== "ADMIN") back(orderId, "Ação não permitida.");
  if (order.status !== "PENDING_PAYMENT") back(orderId, "Este pedido já foi pago.");

  await confirmPaymentReceived(orderId, "dev", `fake-${orderId}`);
  back(orderId);
}

export async function simulatePayout(orderId: string) {
  const user = await requireRole("ADMIN");
  if (!fakePaymentsAllowed()) back(orderId, "Repasse simulado desligado.");
  void user;

  try {
    const payout = await preparePayout(orderId);
    await markPayoutSent(payout.id, { paypalBatchId: "dev", paypalItemId: "dev" });
  } catch (e) {
    back(orderId, e instanceof Error ? e.message : "Erro inesperado.");
  }
  back(orderId);
}
