import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { getDict } from "@/lib/i18n";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { t } = await getDict();
  const next = (await searchParams).next;
  return <AuthForm mode="login" next={typeof next === "string" ? next : undefined} t={t.auth} />;
}
