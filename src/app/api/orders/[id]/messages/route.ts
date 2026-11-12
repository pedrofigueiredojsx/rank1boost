import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { actorOf, CHAT_STATUSES } from "@/lib/orders";
import { messageSchema } from "@/lib/validation";
import { STATUS_LABEL } from "@/lib/format";

// Chat simples por pedido. O navegador consulta esta rota a cada poucos segundos (polling).
// TODO(manutenção): trocar o polling por Supabase Realtime, e limitar a taxa de mensagens.

async function authorize(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !actorOf(user, order)) {
    return { error: NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 }) };
  }
  return { user, order };
}

export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[id]/messages">) {
  const { id } = await ctx.params;
  const auth = await authorize(id);
  if (auth.error) return auth.error;

  const [messages, events] = await Promise.all([
    prisma.message.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: { sender: { select: { name: true } } },
    }),
    prisma.orderStatusEvent.findMany({ where: { orderId: id }, orderBy: { createdAt: "asc" } }),
  ]);

  // Linha do tempo única: mensagens + mudanças de status, em ordem de data.
  const items = [
    ...messages.map((m) => ({
      kind: "message" as const,
      id: m.id,
      mine: m.senderId === auth.user.id,
      author: m.sender.name,
      text: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
    ...events.map((e) => ({
      kind: "event" as const,
      id: e.id,
      text: STATUS_LABEL[e.toStatus],
      createdAt: e.createdAt.toISOString(),
    })),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ items, canWrite: CHAT_STATUSES.includes(auth.order.status) });
}

export async function POST(req: Request, ctx: RouteContext<"/api/orders/[id]/messages">) {
  const { id } = await ctx.params;
  const auth = await authorize(id);
  if (auth.error) return auth.error;

  if (!CHAT_STATUSES.includes(auth.order.status)) {
    return NextResponse.json({ error: "O chat abre quando houver um booster atribuído." }, { status: 409 });
  }

  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensagem inválida (1 a 1000 caracteres)." }, { status: 400 });
  }

  await prisma.message.create({
    data: { orderId: id, senderId: auth.user.id, body: parsed.data.body },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
