import type { pt } from "./pt";

export const en: typeof pt = {
  nav: {
    services: "Services",
    tiers: "Booster tiers",
    how: "How it works",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    dashboard: "My dashboard",
  },
  hero: {
    title: "Climb the ladder with players who've already reached the top.",
    subtitle:
      "Boosting, piloting, coaching and hourly booster rental for arena and RBG. Vetted boosters, and your payment is held until you confirm the service.",
    cta: "See services",
    ctaSecondary: "I want to be a booster",
    ladderTitle: "The top of the ladder",
  },
  services: {
    title: "What you can order",
    from: "from",
    perBlock: "per 100 rating points",
    perHour: "per hour",
    fixed: "fixed price",
    order: "Order",
  },
  tiers: {
    title: "Pick your booster's tier",
    subtitle:
      "The higher the tier, the stronger the booster's track record and the price. You choose when you order.",
    STANDARD: "Booster approved by our team, with a solid rating history.",
    MULTI_GLAD: "Has earned the Gladiator title more than once.",
    R1: "Reached Rank 1 on the ladder in at least one season.",
    AWC: "Has played in the Arena World Championship.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "You place an order",
        text: "Pick a service, send your Armory or Check-PvP link, and tell us the rating you want.",
      },
      {
        title: "Your payment is held",
        text: "The money stays with Rank1Boost. The booster only gets paid after you confirm.",
      },
      {
        title: "A booster takes the order",
        text: "Approved boosters apply and our team picks one. You talk in the order chat.",
      },
      {
        title: "You confirm, the booster gets paid",
        text: "When the booster marks it as done, you check and confirm. If something goes wrong, open a dispute.",
      },
    ],
  },
  auth: {
    loginTitle: "Log in",
    signupTitle: "Create account",
    name: "Name",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters",
    accountType: "Account type",
    client: "Client (I want to hire)",
    booster: "Booster (I want to provide services)",
    loginButton: "Log in",
    signupButton: "Create account",
    noAccount: "Don't have an account yet?",
    hasAccount: "Already have an account?",
  },
  footer: {
    terms: "Terms of use",
    disclaimer: "Rank1Boost is not affiliated with Blizzard Entertainment.",
  },
};
