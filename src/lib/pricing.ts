import { TIER_MULTIPLIER_BPS, type BoosterTierName } from "@/lib/tiers";

export type PricingModelName = "PER_RATING" | "PER_HOUR" | "FIXED";

export type PriceInput = {
  pricingModel: PricingModelName;
  // PER_RATING: preço por 100 pontos | PER_HOUR: preço da hora | FIXED: preço do pacote
  basePriceCents: number;
  currentRating?: number | null;
  targetRating?: number | null;
  hours?: number | null;
  tier: BoosterTierName;
  hasSeasonGear: boolean;
  noGearSurchargeBps: number;
};

// O preço é SEMPRE calculado no servidor. Nunca confie num preço vindo do navegador.
export function calcOrderPrice(input: PriceInput): number {
  let price = input.basePriceCents;

  if (input.pricingModel === "PER_RATING") {
    const { currentRating, targetRating } = input;
    if (currentRating == null || targetRating == null || targetRating <= currentRating) {
      throw new Error("Rating inválido para calcular o preço");
    }
    // MVP: preço linear por bloco de 100 pontos.
    // TODO(manutenção): trocar por preço por FAIXA de rating (subir de 2000 a 2100 custa mais que de 1500 a 1600).
    const blocks = Math.ceil((targetRating - currentRating) / 100);
    price = price * blocks;
  }

  if (input.pricingModel === "PER_HOUR") {
    if (!input.hours || input.hours < 1) throw new Error("Informe as horas");
    price = price * input.hours;
  }

  price = Math.round((price * TIER_MULTIPLIER_BPS[input.tier]) / 10000);

  if (!input.hasSeasonGear) {
    price += Math.round((price * input.noGearSurchargeBps) / 10000);
  }

  return price;
}

// Divide o valor do pedido entre plataforma e booster.
export function splitPayout(grossCents: number, commissionBps: number) {
  const commissionCents = Math.round((grossCents * commissionBps) / 10000);
  return { grossCents, commissionCents, netCents: grossCents - commissionCents };
}
