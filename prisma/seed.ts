import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import type { Prisma } from "../src/generated/prisma/client";

// Catálogo inicial. Os PREÇOS SÃO EXEMPLOS: ajuste para o seu mercado.
// priceCents: PER_RATING = preço por 100 pontos | PER_HOUR = preço da hora | FIXED = preço do pacote.
const services: Prisma.ServiceCreateInput[] = [
  {
    slug: "boost-2v2",
    name: "Arena 2v2 Boost",
    type: "BOOST",
    pricingModel: "PER_RATING",
    activity: "ARENA_2V2",
    description: "O booster joga a sua conta até o rating desejado.",
    priceCents: 900,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "boost-3v3",
    name: "Arena 3v3 Boost",
    type: "BOOST",
    pricingModel: "PER_RATING",
    activity: "ARENA_3V3",
    description: "Time de boosters sobe o seu personagem no 3v3.",
    priceCents: 1200,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "boost-solo-shuffle",
    name: "Solo Shuffle Boost",
    type: "BOOST",
    pricingModel: "PER_RATING",
    activity: "SOLO_SHUFFLE",
    description: "Rating de Solo Shuffle com booster de alto nível.",
    priceCents: 1000,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "boost-rbg",
    name: "RBG Boost",
    type: "BOOST",
    pricingModel: "PER_RATING",
    activity: "RBG",
    description: "Rated Battlegrounds com grupo de boosters.",
    priceCents: 1400,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "pilot-3v3",
    name: "Arena 3v3 Pilot",
    type: "PILOT",
    pricingModel: "PER_RATING",
    activity: "ARENA_3V3",
    description: "O booster pilota o seu personagem no 3v3.",
    priceCents: 1100,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "pilot-solo-shuffle",
    name: "Solo Shuffle Pilot",
    type: "PILOT",
    pricingModel: "PER_RATING",
    activity: "SOLO_SHUFFLE",
    description: "O booster pilota o seu personagem no Solo Shuffle.",
    priceCents: 900,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "selfplay-3v3",
    name: "Arena 3v3 Self-play",
    type: "SELF_PLAY",
    pricingModel: "PER_RATING",
    activity: "ARENA_3V3",
    description: "Você joga junto com o booster, na sua própria conta.",
    priceCents: 1500,
    noGearSurchargeBps: 1500,
  },
  {
    slug: "coach-hourly",
    name: "Coaching por hora",
    type: "COACH",
    pricingModel: "PER_HOUR",
    description: "Aula individual de PvP com um jogador de alto rating.",
    priceCents: 2500,
  },
  {
    slug: "rental-hourly",
    name: "Aluguel de booster por hora",
    type: "RENTAL",
    pricingModel: "PER_HOUR",
    description: "Um booster joga com você pelo tempo que você contratar.",
    priceCents: 2000,
  },
  {
    slug: "vicious-saddle",
    name: "Vicious Saddle",
    type: "PACKAGE",
    pricingModel: "FIXED",
    description: "Pacote fechado até conquistar a Vicious Saddle da season.",
    priceCents: 15000,
    noGearSurchargeBps: 1000,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: service,
      update: service,
    });
  }
  console.log(`Seed ok: ${services.length} serviços.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
