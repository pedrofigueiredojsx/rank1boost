import { prisma } from "@/lib/prisma";
import { splitPayout } from "@/lib/pricing";
import { transitionOrder } from "@/lib/order-state";

// ─────────────────────────────────────────────────────────────
// REPASSE AO BOOSTER (saída, via PayPal Payouts) — PARTE SUA
// ─────────────────────────────────────────────────────────────
// Fluxo: cliente confirma -> preparePayout() cria o registro PENDING
// -> sendPayout() envia pelo PayPal -> markPayoutSent() fecha o pedido.
// O que falta: implementar sendPayout() com a API do PayPal Payouts
// (conta Business, sandbox primeiro) e tratar falhas/retentativas.

export async function preparePayout(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { booster: { include: { boosterProfile: true } } },
  });

  if (!order.boosterId || !order.booster?.boosterProfile) {
    throw new Error("Pedido sem booster.");
  }

  const split = splitPayout(order.priceCents, order.commissionBps);

  return prisma.payout.upsert({
    where: { orderId },
    create: {
      orderId,
      boosterId: order.boosterId,
      ...split,
      currency: order.currency,
      paypalEmail: order.booster.boosterProfile.paypalEmail,
    },
    update: {},
  });
}

export async function sendPayout(payoutId: string): Promise<void> {
  // TODO(você): chamar a API do PayPal Payouts e, em caso de sucesso, chamar markPayoutSent().
  console.warn(`[payout] sendPayout(${payoutId}) ainda não implementado.`);
}

export async function markPayoutSent(
  payoutId: string,
  ids: { paypalBatchId?: string; paypalItemId?: string },
) {
  const payout = await prisma.payout.update({
    where: { id: payoutId },
    data: { status: "SENT", paidAt: new Date(), ...ids },
  });
  await transitionOrder({ orderId: payout.orderId, to: "PAID_OUT", actor: "SYSTEM" });
  return payout;
}
