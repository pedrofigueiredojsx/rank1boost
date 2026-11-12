import { cookies } from "next/headers";
import { pt } from "@/messages/pt";
import { en } from "@/messages/en";

export type Locale = "pt" | "en";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("locale")?.value;
  return value === "en" ? "en" : "pt";
}

// Dicionário simples em objeto TypeScript. Só a landing, o menu e o login
// estão traduzidos; o resto do app está em português.
// TODO(manutenção): traduzir as demais telas (ou migrar para next-intl).
export async function getDict() {
  const locale = await getLocale();
  return { locale, t: locale === "en" ? en : pt };
}

export function intlLocale(locale: Locale) {
  return locale === "en" ? "en-US" : "pt-BR";
}
