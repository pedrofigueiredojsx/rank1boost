import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { actorOf, CHAT_STATUSES } from "@/lib/orders";
import { formatDate, formatMoney } from "@/lib/format";
import { splitPayout } from "@/lib/pricing";
import { TIER_LABEL, type BoosterTierName } from "@/lib/tiers";
import { fakePaymentsAllowed } from "@/lib/payments/payment-service";
import { assignBooster, changeStatus, simulatePayment, simulatePayout } from "@/app/actions/orders";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ChatBox } from "@/components/ChatBox";
import {
  Badge, DefRow, ExtLink, Grid, Grow, H3, ListPanel, Money, Muted, Notice, PageTitle, Panel, Row, RowItem,
  Small, Stack, TextLink,
} from "@/ui/primitives";

export const metadata: Metadata = { title: "Pedido" };

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <DefRow>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </DefRow>
  );
}

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const rawError = (await searchParams).error;
  const error = typeof rawError === "string" ? rawError : undefined;

  const user = await requireUser();
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      client: { select: { name: true, email: true } },
      booster: { select: { name: true } },
      payout: true,
      applications: {
        orderBy: { createdAt: "asc" },
        include: { booster: { select: { name: true, boosterProfile: true } } },
      },
    },
  });
  if (!order) notFound();

  const actor = actorOf(user, order);
  if (!actor) notFound();

  const isClient = actor === "CLIENT";
  const isBooster = actor === "BOOSTER";
  const isAdmin = actor === "ADMIN";
  const s = order.status;
  const earning = splitPayout(order.priceCents, order.commissionBps);

  const act = (to: Parameters<typeof changeStatus>[1]) => changeStatus.bind(null, order.id, to);

  return (
    <Stack $gap={28}>
      <Row $gap={16} $justify="space-between">
        <Grow>
          <Small><TextLink href="/dashboard">Voltar</TextLink></Small>
          <PageTitle>{order.service.name}</PageTitle>
        </Grow>
        <StatusBadge status={s} />
        <div style={{ textAlign: "right" }}>
          <Money $size="2rem">{formatMoney(isBooster ? earning.netCents : order.priceCents, order.currency)}</Money>
          {isBooster ? <><br /><Small>Você recebe (sem a comissão)</Small></> : null}
        </div>
      </Row>

      {error ? <Notice role="alert">{error}</Notice> : null}

      <Grid $cols="1.1fr 0.9fr" $gap={28}>
        <Stack $gap={28}>
          <Panel $pad={24}>
            <H3>Dados do pedido</H3>
            <dl style={{ margin: "8px 0 0" }}>
              <Info label="Personagem">
                <ExtLink href={order.profileUrl} target="_blank" rel="noopener noreferrer">{order.profileUrl}</ExtLink>
              </Info>
              <Info label="Classe e spec">{order.wowClass} · {order.spec}</Info>
              {order.currentRating != null ? <Info label="Rating atual">{order.currentRating}</Info> : null}
              {order.targetRating != null ? <Info label="Rating desejado">{order.targetRating}</Info> : null}
              {order.hours != null ? <Info label="Horas">{order.hours}</Info> : null}
              <Info label="Gear da season">{order.hasSeasonGear ? "Tem" : "Não tem"}</Info>
              <Info label="Nível pedido">{TIER_LABEL[order.requestedTier as BoosterTierName]}</Info>
              {order.notes ? <Info label="Observações"><span style={{ whiteSpace: "pre-wrap" }}>{order.notes}</span></Info> : null}
              <Info label="Cliente">{order.client.name}{isAdmin ? ` (${order.client.email})` : ""}</Info>
              {order.booster ? <Info label="Booster">{order.booster.name}</Info> : null}
              <Info label="Criado em">{formatDate(order.createdAt)}</Info>
            </dl>
          </Panel>

          <Panel $pad={24}>
            <Stack $gap={18}>
              <H3>Ações</H3>

              {isClient && s === "PENDING_PAYMENT" ? (
                <Stack $gap={12}>
                  {/* TODO(você): aqui entra o botão "Pagar" que chama getPaymentProvider().createCheckout() */}
                  <Muted>O pagamento ainda não foi implementado. Ele é a sua parte do projeto (veja src/lib/payments).</Muted>
                  {fakePaymentsAllowed() ? (
                    <form action={simulatePayment.bind(null, order.id)}>
                      <SubmitButton variant="ghost">Simular pagamento (só em desenvolvimento)</SubmitButton>
                    </form>
                  ) : null}
                </Stack>
              ) : null}

              {isClient && s === "COMPLETED_BY_BOOSTER" ? (
                <Stack $gap={12}>
                  <Muted>O booster marcou como concluído. Confira o rating no Armory ou Check-PvP antes de confirmar.</Muted>
                  <Row>
                    <form action={act("CONFIRMED_BY_CLIENT")}><SubmitButton>Confirmar e liberar pagamento</SubmitButton></form>
                    <form action={act("IN_PROGRESS")}><SubmitButton variant="ghost">Ainda não ficou pronto</SubmitButton></form>
                  </Row>
                </Stack>
              ) : null}

              {isBooster && s === "ASSIGNED" ? (
                <form action={act("IN_PROGRESS")}><SubmitButton>Começar o serviço</SubmitButton></form>
              ) : null}

              {isBooster && s === "IN_PROGRESS" ? (
                <form action={act("COMPLETED_BY_BOOSTER")}><SubmitButton>Marcar como concluído</SubmitButton></form>
              ) : null}

              {isAdmin && s === "AWAITING_BOOSTER" ? (
                <Stack $gap={8}>
                  <strong>Candidatos</strong>
                  {order.applications.length === 0 ? (
                    <Muted>Nenhum booster se candidatou ainda.</Muted>
                  ) : (
                    <ListPanel style={{ background: "transparent" }}>
                      {order.applications.map((a) => (
                        <RowItem key={a.id} style={{ padding: "12px 0" }}>
                          <Grow>
                            <strong>{a.booster.name}</strong>{" "}
                            <Badge $tone="gold">{TIER_LABEL[(a.booster.boosterProfile?.tier ?? "STANDARD") as BoosterTierName]}</Badge>
                            {a.message ? <><br /><Small>{a.message}</Small></> : null}
                          </Grow>
                          <form action={assignBooster.bind(null, order.id)}>
                            <input type="hidden" name="boosterId" value={a.boosterId} />
                            <SubmitButton>Atribuir</SubmitButton>
                          </form>
                        </RowItem>
                      ))}
                    </ListPanel>
                  )}
                </Stack>
              ) : null}

              {isAdmin && s === "ASSIGNED" ? (
                <form action={act("AWAITING_BOOSTER")}><SubmitButton variant="ghost">Desatribuir booster</SubmitButton></form>
              ) : null}

              {isAdmin && s === "COMPLETED_BY_BOOSTER" ? (
                <form action={act("CONFIRMED_BY_CLIENT")}><SubmitButton variant="ghost">Confirmar pelo cliente (admin)</SubmitButton></form>
              ) : null}

              {isAdmin && s === "DISPUTED" ? (
                <Row>
                  <form action={act("IN_PROGRESS")}><SubmitButton variant="ghost">Voltar para em andamento</SubmitButton></form>
                  <form action={act("CONFIRMED_BY_CLIENT")}><SubmitButton variant="ghost">Resolver: liberar pagamento</SubmitButton></form>
                </Row>
              ) : null}

              {isAdmin && s === "CONFIRMED_BY_CLIENT" ? (
                <Stack $gap={10}>
                  <Muted>
                    Repasse ao booster: {formatMoney(earning.netCents, order.currency)} (comissão {formatMoney(earning.commissionCents, order.currency)}).
                    {order.payout ? ` Status do repasse: ${order.payout.status}.` : ""}
                  </Muted>
                  {/* TODO(você): botão para reenviar o repasse quando o PayPal falhar */}
                  {fakePaymentsAllowed() ? (
                    <form action={simulatePayout.bind(null, order.id)}>
                      <SubmitButton variant="ghost">Simular repasse (só em desenvolvimento)</SubmitButton>
                    </form>
                  ) : null}
                </Stack>
              ) : null}

              <Row style={{ borderTop: "1px solid #2B2B31", paddingTop: 16 }}>
                {(isClient || isAdmin) && (s === "PENDING_PAYMENT" || s === "AWAITING_BOOSTER") ? (
                  <form action={act("CANCELLED")}><SubmitButton variant="danger">Cancelar pedido</SubmitButton></form>
                ) : null}
                {s === "ASSIGNED" || s === "IN_PROGRESS" || (s === "COMPLETED_BY_BOOSTER" && !isBooster) ? (
                  <form action={act("DISPUTED")}><SubmitButton variant="danger">Abrir disputa</SubmitButton></form>
                ) : null}
                {isAdmin && (s === "ASSIGNED" || s === "IN_PROGRESS" || s === "DISPUTED") ? (
                  <form action={act("CANCELLED")}><SubmitButton variant="danger">Cancelar (admin)</SubmitButton></form>
                ) : null}
              </Row>
              {s === "PAID_OUT" || s === "CANCELLED" ? <Muted>Este pedido está encerrado.</Muted> : null}
            </Stack>
          </Panel>
        </Stack>

        <Stack $gap={12}>
          <H3>Chat</H3>
          <ChatBox orderId={order.id} enabled={CHAT_STATUSES.includes(s)} />
        </Stack>
      </Grid>
    </Stack>
  );
}
