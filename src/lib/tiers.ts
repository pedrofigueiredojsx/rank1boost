export const TIER_ORDER = ["STANDARD", "MULTI_GLAD", "R1", "AWC"] as const;
export type BoosterTierName = (typeof TIER_ORDER)[number];

// Valores de exemplo (10000 = preço normal). Ajuste conforme o mercado.
export const TIER_MULTIPLIER_BPS: Record<BoosterTierName, number> = {
  STANDARD: 10000,
  MULTI_GLAD: 13000,
  R1: 16000,
  AWC: 22000,
};

export const TIER_LABEL: Record<BoosterTierName, string> = {
  STANDARD: "Standard",
  MULTI_GLAD: "Multi-Glad",
  R1: "R1",
  AWC: "AWC",
};

// Booster de nível maior pode pegar pedido de nível menor (e ganha pelo preço do pedido).
// Se não quiser isso, troque >= por ===.
export function canTakeOrder(boosterTier: BoosterTierName, requestedTier: BoosterTierName) {
  return TIER_ORDER.indexOf(boosterTier) >= TIER_ORDER.indexOf(requestedTier);
}
