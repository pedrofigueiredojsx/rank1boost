import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { getDict } from "@/lib/i18n";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignupPage() {
  const { t } = await getDict();
  return <AuthForm mode="signup" t={t.auth} />;
}
