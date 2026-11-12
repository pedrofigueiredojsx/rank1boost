import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canTakeOrder, TIER_LABEL, type BoosterTierName } from "@/lib/tiers";
import { formatDate, formatMoney } from "@/lib/format";
import { splitPayout } from "@/lib/pricing";
import { applyToOrder } from "@/app/actions/orders";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Badge, ButtonLink, Eyebrow, Grow, H2, H3, Input, ListPanel, Money, Muted, PageTitle, Panel, Row, RowItem,
  RowLink, Small, Stack,
} from "@/ui/primitives";

export const metadata: Metadata = { title: "Painel do booster" };

export default async function BoosterPage() {
  const user = await requireRole("BOOSTER");
  const profile = user.boosterProfile;

  if (!profile) {
    return (
      <Panel $pad={28} style={{ maxWidth: 560, margin: "0 auto" }}>
        <Stack $gap={16}>
          <PageTitle>Complete seu perfil</PageTitle>
          <Muted>Antes de pegar pedidos, a equipe precisa conferir seus dados e aprovar o seu perfil.</Muted>
          <div><ButtonLink href="/booster/profile">Preencher perfil</ButtonLink></div>
        </Stack>
      </Panel>
    );
  }

  const approved = profile.status === "APPROVED";

  const [openOrders, myOrders] = await Promise.all([
    approved
      ? prisma.order.findMany({
          where: { status: "AWAITING_BOOSTER" },
          orderBy: { createdAt: "asc" },
          include: { service: true, applications: { where: { boosterId: user.id } } },
        })
      : Promise.resolve([]),
    prisma.order.findMany({
      where: { boosterId: user.id },
      orderBy: { createdAt: "desc" },
      include: { service: true },
    }),
  ]);

  const available = openOrders.filter((o) =>
    canTakeOrder(profile.tier as BoosterTierName, o.requestedTier as BoosterTierName),
  );

  return (
    <Stack $gap={44}>
      <Row $gap={14}>
        <Grow><PageTitle>Painel do booster</PageTitle></Grow>
        <Badge $tone="gold">Nível {TIER_LABEL[profile.tier as BoosterTierName]}</Badge>
        <Badge $tone={approved ? "success" : "muted"}>
          {approved ? "Aprovado" : profile.status === "PENDING" ? "Em análise" : "Suspenso"}
        </Badge>
        <ButtonLink href="/booster/profile" $variant="ghost">Editar perfil</ButtonLink>
      </Row>

      {!approved ? (
        <Panel $pad={24}>
          <Muted>
            {profile.status === "PENDING"
              ? "Seu perfil está em análise. Assim que a equipe aprovar, os pedidos abertos aparecem aqui."
              : "Seu perfil está suspenso. Fale com a equipe."}
          </Muted>
        </Panel>
      ) : null}

      {approved ? (
        <Stack $gap={16}>
          <Eyebrow>Disponíveis</Eyebrow>
          <H2>Pedidos abertos</H2>
          {available.length === 0 ? (
            <Panel $pad={24}><Muted>Nenhum pedido aberto para o seu nível agora.</Muted></Panel>
          ) : (
            <ListPanel>
              {available.map((o) => {
                const applied = o.applications.length > 0;
                const net = splitPayout(o.priceCents, o.commissionBps).netCents;
                return (
                  <RowItem key={o.id}>
                    <Grow>
                      <H3>{o.service.name}</H3>
                      <Small>
                        {o.wowClass} · {o.spec}
                        {o.currentRating != null && o.targetRating != null ? ` · ${o.currentRating} → ${o.targetRating}` : ""}
                        {o.hours != null ? ` · ${o.hours}h` : ""}
                        {` · ${TIER_LABEL[o.requestedTier as BoosterTierName]}`}
                        {o.hasSeasonGear ? " · com gear" : " · sem gear"}
                      </Small>
                    </Grow>
                    <Money>{formatMoney(net, o.currency)}</Money>
                    {applied ? (
                      <Badge>Você já se candidatou</Badge>
                    ) : (
                      <form action={applyToOrder.bind(null, o.id)}>
                        <Row $gap={8}>
                          <Input name="message" placeholder="Mensagem (opcional)" maxLength={300} style={{ width: 220 }} aria-label="Mensagem" />
                          <SubmitButton>Candidatar</SubmitButton>
                        </Row>
                      </form>
                    )}
                  </RowItem>
                );
              })}
            </ListPanel>
          )}
        </Stack>
      ) : null}

      <Stack $gap={16}>
        <Eyebrow>Atribuídos a você</Eyebrow>
        <H2>Meus pedidos</H2>
        {myOrders.length === 0 ? (
          <Panel $pad={24}><Muted>Você ainda não tem pedidos atribuídos.</Muted></Panel>
        ) : (
          <ListPanel>
            {myOrders.map((o) => (
              <li key={o.id}>
                <RowLink href={`/orders/${o.id}`}>
                  <Grow><strong>{o.service.name}</strong></Grow>
                  <Small>{formatDate(o.createdAt)}</Small>
                  <StatusBadge status={o.status} />
                  <Money $size="1.1rem">{formatMoney(splitPayout(o.priceCents, o.commissionBps).netCents, o.currency)}</Money>
                </RowLink>
              </li>
            ))}
          </ListPanel>
        )}
      </Stack>
    </Stack>
  );
}
