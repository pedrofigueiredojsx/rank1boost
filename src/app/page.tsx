import { prisma } from "@/lib/prisma";
import { getDict, intlLocale } from "@/lib/i18n";
import { formatMoney, SERVICE_TYPE_LABEL } from "@/lib/format";
import { TIER_LABEL, TIER_ORDER } from "@/lib/tiers";
import {
  Badge, ButtonLink, Eyebrow, Grow, H1, H2, H3, Lead, ListPanel, Money, Muted, Row, Small, Stack,
} from "@/ui/primitives";
import {
  Hero, Podium, Section, ServicePrice, ServiceRow, Step, StepNum, Steps, TierList, TierRow,
} from "@/ui/landing";

export default async function HomePage() {
  const { t, locale } = await getDict();
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const priceSuffix = {
    PER_RATING: t.services.perBlock,
    PER_HOUR: t.services.perHour,
    FIXED: t.services.fixed,
  } as const;

  return (
    <>
      <Hero>
        <Stack $gap={24}>
          <Eyebrow>WoW PvP Boosting</Eyebrow>
          <H1>{t.hero.title}</H1>
          <Lead>{t.hero.subtitle}</Lead>
          <Row $gap={12}>
            <ButtonLink href="/#services">{t.hero.cta}</ButtonLink>
            <ButtonLink href="/signup" $variant="ghost">{t.hero.ctaSecondary}</ButtonLink>
          </Row>
        </Stack>
        <Podium label={t.hero.ladderTitle} />
      </Hero>

      <Section id="services">
        <Stack $gap={8}>
          <Eyebrow>{t.nav.services}</Eyebrow>
          <H2>{t.services.title}</H2>
        </Stack>
        {services.length === 0 ? (
          <Muted>Nenhum serviço cadastrado ainda. Rode o seed: npm run db:seed</Muted>
        ) : (
          <ListPanel>
            {services.map((s) => (
              <ServiceRow key={s.id}>
                <div>
                  <H3>{s.name}</H3>
                  {s.description ? <Small>{s.description}</Small> : null}
                </div>
                <Badge>{SERVICE_TYPE_LABEL[s.type]}</Badge>
                <ServicePrice>
                  <Small>{t.services.from} </Small>
                  <Money>{formatMoney(s.priceCents, s.currency, intlLocale(locale))}</Money>
                  <br />
                  <Small>{priceSuffix[s.pricingModel]}</Small>
                </ServicePrice>
                <ButtonLink href={`/orders/new?service=${s.slug}`} $variant="ghost">
                  {t.services.order}
                </ButtonLink>
              </ServiceRow>
            ))}
          </ListPanel>
        )}
      </Section>

      <Section id="tiers">
        <Stack $gap={8}>
          <Eyebrow>{t.nav.tiers}</Eyebrow>
          <H2>{t.tiers.title}</H2>
          <Lead>{t.tiers.subtitle}</Lead>
        </Stack>
        <TierList>
          {TIER_ORDER.map((tier, i) => (
            <TierRow key={tier} $step={i}>
              <dt>{TIER_LABEL[tier]}</dt>
              <dd>{t.tiers[tier]}</dd>
            </TierRow>
          ))}
        </TierList>
      </Section>

      <Section id="how">
        <Stack $gap={8}>
          <Eyebrow>{t.nav.how}</Eyebrow>
          <H2>{t.how.title}</H2>
        </Stack>
        <Steps>
          {t.how.steps.map((step, i) => (
            <Step key={step.title}>
              <StepNum>{i + 1}</StepNum>
              <Grow>
                <H3>{step.title}</H3>
                <Muted>{step.text}</Muted>
              </Grow>
            </Step>
          ))}
        </Steps>
      </Section>
    </>
  );
}
