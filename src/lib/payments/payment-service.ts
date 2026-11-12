import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/order-state";

// Chame esta função quando o pagamento do cliente for CONFIRMADO
// (no webhook do seu provedor). O dinheiro fica retido na plataforma (escrow)
// até o cliente confirmar o serviço.
export async function confirmPaymentReceived(
  orderId: string,
  provider: string,
  providerRef: string,
) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider,
      providerRef,
      amountCents: order.priceCents,
      currency: order.currency,
      status: "HELD",
    },
    update: { provider, providerRef, status: "HELD" },
  });

  return transitionOrder({ orderId, to: "AWAITING_BOOSTER", actor: "SYSTEM" });
}

// Só para desenvolvimento: finge que o pagamento caiu.
export function fakePaymentsAllowed() {
  return process.env.ALLOW_FAKE_PAYMENTS === "true" && process.env.NODE_ENV !== "production";
}
