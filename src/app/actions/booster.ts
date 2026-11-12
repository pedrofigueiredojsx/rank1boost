"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { boosterProfileSchema } from "@/lib/validation";
import { TIER_ORDER } from "@/lib/tiers";
import { optStr, str, type FormState } from "@/lib/form";

function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function saveBoosterProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireRole("BOOSTER");

  const parsed = boosterProfileSchema.safeParse({
    country: str(fd, "country"),
    profileUrl: str(fd, "profileUrl"),
    paypalEmail: str(fd, "paypalEmail"),
    languages: splitList(str(fd, "languages")),
    regions: splitList(str(fd, "regions")).map((r) => r.toUpperCase()),
    bio: optStr(fd, "bio"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  // Na criação o perfil fica PENDING; status e nível só o admin muda.
  await prisma.boosterProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: { ...parsed.data },
  });

  redirect("/booster");
}

// ───────────── Ações do admin sobre boosters ─────────────

export async function setBoosterStatus(userId: string, status: "APPROVED" | "SUSPENDED") {
  await requireRole("ADMIN");
  await prisma.boosterProfile.update({ where: { userId }, data: { status } });
  revalidatePath("/admin");
}

export async function setBoosterTier(userId: string, fd: FormData) {
  await requireRole("ADMIN");
  const tier = str(fd, "tier");
  if (!(TIER_ORDER as readonly string[]).includes(tier)) return;
  await prisma.boosterProfile.update({
    where: { userId },
    data: { tier: tier as (typeof TIER_ORDER)[number] },
  });
  revalidatePath("/admin");
}
