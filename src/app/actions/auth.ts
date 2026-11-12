"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation";
import { str, type FormState } from "@/lib/form";
import { getLocale } from "@/lib/i18n";

// Só aceita caminhos internos como destino do login (evita redirecionar para outro site).
function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function signup(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: str(fd, "name"),
    email: str(fd, "email"),
    password: str(fd, "password"),
    accountType: str(fd, "accountType") || "CLIENT",
  });
  if (!parsed.success) {
    return { fieldErrors: (await import("zod")).z.flattenError(parsed.error).fieldErrors };
  }
  const { name, email, password, accountType } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Não foi possível criar a conta." };
  }

  const locale = (await getLocale()) === "en" ? "en" : "pt-BR";
  await prisma.user.upsert({
    where: { id: data.user.id },
    create: { id: data.user.id, email, name, role: accountType, locale },
    update: {},
  });

  // Com "Confirm email" ligado no Supabase, não há sessão até confirmar o e-mail.
  if (!data.session) {
    return { ok: true, error: "Conta criada. Confirme seu e-mail para entrar." };
  }
  redirect(accountType === "BOOSTER" ? "/booster/profile" : "/dashboard");
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) {
    return { fieldErrors: (await import("zod")).z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "E-mail ou senha incorretos." };

  // Garante a linha no nosso banco (caso o cadastro tenha sido interrompido).
  const existing = await prisma.user.findUnique({ where: { id: data.user.id } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: parsed.data.email,
        name: String(data.user.user_metadata?.name ?? parsed.data.email.split("@")[0]),
      },
    });
  }

  redirect(safeNext(str(fd, "next")));
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function setLocale(fd: FormData) {
  const value = str(fd, "locale") === "en" ? "en" : "pt";
  (await cookies()).set("locale", value, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
