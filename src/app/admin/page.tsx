import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { TIER_LABEL, TIER_ORDER } from "@/lib/tiers";
import { setBoosterStatus, setBoosterTier } from "@/app/actions/booster";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Badge, Eyebrow, ExtLink, Grow, H2, ListPanel, Money, Muted, PageTitle, Panel, Row, RowItem, RowLink, Select,
  Small, Stack,
} from "@/ui/primitives";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireRole("ADMIN");

  const [boosters, orders] = await Promise.all([
    prisma.boosterProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { service: true, client: { select: { name: true } } },
    }),
  ]);

  const pending = boosters.filter((b) => b.status === "PENDING").length;
  const needsAction = orders.filter((o) => o.status === "AWAITING_BOOSTER" || o.status === "DISPUTED").length;

  return (
    <Stack $gap={48}>
      <PageTitle>Painel admin</PageTitle>

      <Stack $gap={16}>
        <Eyebrow>Equipe</Eyebrow>
        <H2>Boosters{pending > 0 ? ` (${pending} pendente${pending > 1 ? "s" : ""})` : ""}</H2>
        {boosters.length === 0 ? (
          <Panel $pad={24}><Muted>Nenhum booster cadastrado ainda.</Muted></Panel>
        ) : (
          <ListPanel>
            {boosters.map((b) => (
              <RowItem key={b.userId}>
                <Grow>
                  <strong>{b.user.name}</strong> <Small>{b.user.email}</Small>
                  <br />
                  <Small>
                    {b.country} · {b.languages.join(", ")} · {b.regions.join(", ")} ·{" "}
                    <ExtLink href={b.profileUrl} target="_blank" rel="noopener noreferrer">perfil</ExtLink>
                  </Small>
                </Grow>
                <Badge $tone={b.status === "APPROVED" ? "success" : b.status === "SUSPENDED" ? "danger" : "muted"}>{b.status}</Badge>
                <form action={setBoosterTier.bind(null, b.userId)}>
                  <Row $gap={8}>
                    <Select name="tier" defaultValue={b.tier} style={{ width: 140 }} aria-label="Nível">
                      {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                    </Select>
                    <SubmitButton variant="ghost">Salvar nível</SubmitButton>
                  </Row>
                </form>
                {b.status !== "APPROVED" ? (
                  <form action={setBoosterStatus.bind(null, b.userId, "APPROVED")}><SubmitButton>Aprovar</SubmitButton></form>
                ) : (
                  <form action={setBoosterStatus.bind(null, b.userId, "SUSPENDED")}><SubmitButton variant="danger">Suspender</SubmitButton></form>
                )}
              </RowItem>
            ))}
          </ListPanel>
        )}
      </Stack>

      <Stack $gap={16}>
        <Eyebrow>Operação</Eyebrow>
        <H2>Pedidos{needsAction > 0 ? ` (${needsAction} pedem ação)` : ""}</H2>
        {orders.length === 0 ? (
          <Panel $pad={24}><Muted>Nenhum pedido ainda.</Muted></Panel>
        ) : (
          <ListPanel>
            {orders.map((o) => (
              <li key={o.id}>
                <RowLink href={`/orders/${o.id}`}>
                  <Grow>
                    <strong>{o.service.name}</strong> <Small>· {o.client.name}</Small>
                  </Grow>
                  <Small>{formatDate(o.createdAt)}</Small>
                  <StatusBadge status={o.status} />
                  <Money $size="1.1rem">{formatMoney(o.priceCents, o.currency)}</Money>
                </RowLink>
              </li>
            ))}
          </ListPanel>
        )}
      </Stack>
    </Stack>
  );
}
