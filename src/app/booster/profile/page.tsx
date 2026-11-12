import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { BoosterProfileForm } from "@/components/BoosterProfileForm";

export const metadata: Metadata = { title: "Perfil de booster" };

export default async function BoosterProfilePage() {
  const user = await requireRole("BOOSTER");
  const p = user.boosterProfile;

  return (
    <BoosterProfileForm
      initial={{
        country: p?.country ?? "",
        profileUrl: p?.profileUrl ?? "",
        paypalEmail: p?.paypalEmail ?? "",
        languages: p?.languages.join(", ") ?? "",
        regions: p?.regions.join(", ") ?? "",
        bio: p?.bio ?? "",
      }}
    />
  );
}
