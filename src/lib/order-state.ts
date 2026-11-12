import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export type Actor = "CLIENT" | "BOOSTER" | "ADMIN" | "SYSTEM";

// Máquina de estados do pedido: de qual status para qual, e QUEM pode fazer.
// É o coração do sistema. Qualquer mudança de status passa por aqui.
const TRANSITIONS: Record<OrderStatus, Partial<Record<OrderStatus, Actor[]>>> = {
  PENDING_PAYMENT: {
    AWAITING_BOOSTER: ["SYSTEM", "ADMIN"], // pagamento confirmado
    CANCELLED: ["CLIENT", "ADMIN"],
  },
  AWAITING_BOOSTER: {
    ASSIGNED: ["ADMIN"],
    CANCELLED: ["CLIENT", "ADMIN"], // TODO(pagamento): reembolsar o cliente
  },
  ASSIGNED: {
    IN_PROGRESS: ["BOOSTER"],
    AWAITING_BOOSTER: ["ADMIN"], // desatribuir
    DISPUTED: ["CLIENT", "BOOSTER", "ADMIN"],
    CANCELLED: ["ADMIN"],
  },
  IN_PROGRESS: {
    COMPLETED_BY_BOOSTER: ["BOOSTER"],
    DISPUTED: ["CLIENT", "BOOSTER", "ADMIN"],
    CANCELLED: ["ADMIN"],
  },
  COMPLETED_BY_BOOSTER: {
    CONFIRMED_BY_CLIENT: ["CLIENT", "ADMIN"],
    IN_PROGRESS: ["CLIENT", "ADMIN"], // cliente diz que não ficou pronto
    DISPUTED: ["CLIENT", "ADMIN"],
  },
  CONFIRMED_BY_CLIENT: {
    PAID_OUT: ["SYSTEM", "ADMIN"], // repasse enviado ao booster
  },
  PAID_OUT: {},
  CANCELLED: {},
  DISPUTED: {
    IN_PROGRESS: ["ADMIN"],
    CONFIRMED_BY_CLIENT: ["ADMIN"],
    CANCELLED: ["ADMIN"],
  },
};

export class OrderError extends Error {}

export function canTransition(from: OrderStatus, to: OrderStatus, actor: Actor): boolean {
  return TRANSITIONS[from][to]?.includes(actor) ?? false;
}

// Próximos status possíveis para um ator (usado para decidir quais botões mostrar).
export function nextStatuses(from: OrderStatus, actor: Actor): OrderStatus[] {
  return (Object.keys(TRANSITIONS[from]) as OrderStatus[]).filter((to) =>
    canTransition(from, to, actor),
  );
}

type TransitionArgs = {
  orderId: string;
  to: OrderStatus;
  actor: Actor;
  actorId?: string | null;
  boosterId?: string; // obrigatório ao ir para ASSIGNED
};

export async function transitionOrder(args: TransitionArgs) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: args.orderId } });
    if (!order) throw new OrderError("Pedido não encontrado.");

    if (!canTransition(order.status, args.to, args.actor)) {
      throw new OrderError(`Ação não permitida: ${order.status} → ${args.to}.`);
    }

    const now = new Date();
    const data: Prisma.OrderUncheckedUpdateManyInput = { status: args.to };

    if (args.to === "ASSIGNED") {
      if (!args.boosterId) throw new OrderError("Escolha um booster.");
      data.boosterId = args.boosterId;
      data.assignedAt = now;
    }
    if (args.to === "AWAITING_BOOSTER" && order.status === "ASSIGNED") {
      data.boosterId = null;
      data.assignedAt = null;
    }
    if (args.to === "COMPLETED_BY_BOOSTER") data.completedAt = now;
    if (args.to === "CONFIRMED_BY_CLIENT") data.confirmedAt = now;

    // Só atualiza se o status ainda for o que lemos (evita duas ações ao mesmo tempo).
    const result = await tx.order.updateMany({
      where: { id: order.id, status: order.status },
      data,
    });
    if (result.count === 0) {
      throw new OrderError("O pedido mudou enquanto você agia. Recarregue a página.");
    }

    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: args.to,
        actorId: args.actorId ?? null,
      },
    });

    return tx.order.findUniqueOrThrow({ where: { id: order.id } });
  });
}
