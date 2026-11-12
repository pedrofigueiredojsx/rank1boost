// Tokens de design em um lugar só. Mudou a cor aqui, mudou o site inteiro.
export const color = {
  bg: "#0B0B0C", // preto
  surface: "#141416",
  raised: "#1D1D21",
  line: "#2B2B31",
  text: "#F5F3EC",
  muted: "#A0A0AA",
  gold: "#F7C600", // amarelo do símbolo do R1
  goldHover: "#FFD52E",
  onGold: "#0B0B0C",
  danger: "#FF6A5C",
  success: "#3DDC97",
  info: "#5AA9FF",
} as const;

export const font = {
  heading: '"Outfit Variable", system-ui, sans-serif',
  body: '"Inter Variable", system-ui, sans-serif',
} as const;

export const radius = "10px";

// Media query "a partir de": mobile primeiro.
export const from = {
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 860px)",
  lg: "@media (min-width: 1100px)",
} as const;
