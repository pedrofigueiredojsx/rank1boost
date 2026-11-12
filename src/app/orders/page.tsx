import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink, Grow, ListPanel, Muted, Money, PageTitle, Panel, Row, RowLink, Small, Stack, TextLink } from "@/ui/primitives";

export const metadata: Metadata = { title: "Meus pedidos" };

export default async function OrdersPage() {
  const user = await requireRole("CLIENT");
  const orders = await prisma.order.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });

  return (
    <Stack $gap={24}>
      <Row $justify="space-between" $align="flex-end">
        <PageTitle>Meus pedidos</PageTitle>
        <ButtonLink href="/#services">Novo pedido</ButtonLink>
      </Row>

      {orders.length === 0 ? (
        <Panel $pad={24}>
          <Muted>
            Você ainda não tem pedidos. <TextLink href="/#services">Escolha um serviço</TextLink> para começar.
          </Muted>
        </Panel>
      ) : (
        <ListPanel>
          {orders.map((o) => (
            <li key={o.id}>
              <RowLink href={`/orders/${o.id}`}>
                <Grow><strong>{o.service.name}</strong></Grow>
                <Small>{formatDate(o.createdAt)}</Small>
                <StatusBadge status={o.status} />
                <Money $size="1.1rem">{formatMoney(o.priceCents, o.currency)}</Money>
              </RowLink>
            </li>
          ))}
        </ListPanel>
      )}
    </Stack>
  );
}
