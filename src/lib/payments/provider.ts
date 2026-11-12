// ─────────────────────────────────────────────────────────────
// PAGAMENTO DO CLIENTE (entrada) — PARTE SUA
// ─────────────────────────────────────────────────────────────
// Aqui entra o Stripe (cartão) e/ou Pix. O que falta fazer:
//   1. Implementar createCheckout() criando a sessão de pagamento no provedor.
//   2. Criar a rota /api/webhooks/<provedor> que valida a assinatura do webhook
//      e, quando o pagamento for confirmado, chama confirmPaymentReceived().
//   3. Testar tudo no modo sandbox ANTES de usar dinheiro de verdade.

export type CheckoutInput = {
  orderId: string;
  amountCents: number;
  currency: string;
  clientEmail: string;
};

export interface PaymentProvider {
  name: string;
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
}

export function getPaymentProvider(): PaymentProvider {
  // TODO(você): retornar sua implementação (ex: StripeProvider).
  throw new Error("Provedor de pagamento ainda não implementado.");
}
