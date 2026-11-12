import { z } from "zod";
import { WOW_CLASSES, SPECS_BY_CLASS } from "@/lib/wow";
import { TIER_ORDER } from "@/lib/tiers";

// O booster vai clicar nesses links: só aceitamos os dois sites oficiais.
const ALLOWED_HOSTS = ["worldofwarcraft.blizzard.com", "check-pvp.fr", "www.check-pvp.fr"];

export const profileUrlSchema = z
  .url("Informe um link válido")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && ALLOWED_HOSTS.includes(url.hostname);
    } catch {
      return false;
    }
  }, "Use um link do Armory ou do Check-PvP");

export const orderInputSchema = z
  .object({
    serviceId: z.uuid("Serviço inválido"),
    requestedTier: z.enum(TIER_ORDER),
    profileUrl: profileUrlSchema,
    wowClass: z.enum(WOW_CLASSES, "Escolha a classe"),
    spec: z.string().min(1, "Escolha a spec"),
    currentRating: z.number().int().min(0).max(4000).optional(),
    targetRating: z.number().int().min(0).max(4000).optional(),
    hours: z.number().int().min(1).max(40).optional(),
    hasSeasonGear: z.boolean("Diga se você tem o gear da season"),
    notes: z.string().max(500, "Máximo de 500 caracteres").optional(),
  })
  .refine(
    (d) => (SPECS_BY_CLASS[d.wowClass] as readonly string[]).includes(d.spec),
    { message: "Essa spec não existe para a classe escolhida", path: ["spec"] },
  )
  .refine(
    (d) =>
      d.currentRating == null || d.targetRating == null || d.targetRating > d.currentRating,
    { message: "O rating desejado precisa ser maior que o atual", path: ["targetRating"] },
  );

export const boosterProfileSchema = z.object({
  country: z.string().length(2, "Use o código do país com 2 letras, ex: BR").toUpperCase(),
  profileUrl: profileUrlSchema,
  paypalEmail: z.email("E-mail do PayPal inválido"),
  languages: z.array(z.string().min(2)).min(1, "Informe ao menos um idioma"),
  regions: z.array(z.string().min(2)).min(1, "Informe ao menos uma região"),
  bio: z.string().max(500).optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome").max(80),
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
  accountType: z.enum(["CLIENT", "BOOSTER"]),
});

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});
