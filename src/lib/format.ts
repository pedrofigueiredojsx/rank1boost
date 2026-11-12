import type { OrderStatus } from "@/generated/prisma/client";

export function formatMoney(cents: number, currency = "USD", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

export function formatDate(date: Date, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(date);
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  AWAITING_BOOSTER: "Procurando booster",
  ASSIGNED: "Booster atribuído",
  IN_PROGRESS: "Em andamento",
  COMPLETED_BY_BOOSTER: "Concluído pelo booster",
  CONFIRMED_BY_CLIENT: "Confirmado pelo cliente",
  PAID_OUT: "Pago ao booster",
  CANCELLED: "Cancelado",
  DISPUTED: "Em disputa",
};

export const SERVICE_TYPE_LABEL = {
  BOOST: "Boost",
  PILOT: "Pilot",
  SELF_PLAY: "Self-play",
  COACH: "Coach",
  RENTAL: "Aluguel por hora",
  PACKAGE: "Pacote",
} as const;
