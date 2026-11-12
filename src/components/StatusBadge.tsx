import type { OrderStatus } from "@/generated/prisma/client";
import { STATUS_LABEL } from "@/lib/format";
import { Badge } from "@/ui/primitives";

const TONE: Record<OrderStatus, "gold" | "info" | "success" | "danger" | "muted"> = {
  PENDING_PAYMENT: "muted",
  AWAITING_BOOSTER: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "gold",
  COMPLETED_BY_BOOSTER: "gold",
  CONFIRMED_BY_CLIENT: "success",
  PAID_OUT: "success",
  CANCELLED: "muted",
  DISPUTED: "danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge $tone={TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
