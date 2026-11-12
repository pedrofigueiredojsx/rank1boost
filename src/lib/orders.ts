import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Actor } from "@/lib/order-state";
import type { Order, OrderStatus, User } from "@/generated/prisma/client";

// Quem é o usuário em relação a este pedido? (null = não tem nada a ver com ele)
export function actorOf(user: Pick<User, "id" | "role">, order: Pick<Order, "clientId" | "boosterId">): Actor | null {
  if (user.role === "ADMIN") return "ADMIN";
  if (order.clientId === user.id) return "CLIENT";
  if (order.boosterId === user.id) return "BOOSTER";
  return null;
}

// O chat só existe quando já há booster atribuído.
export const CHAT_STATUSES: OrderStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED_BY_BOOSTER",
  "CONFIRMED_BY_CLIENT",
  "PAID_OUT",
  "DISPUTED",
];

export async function getOrderOr404(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) notFound();
  return order;
}
