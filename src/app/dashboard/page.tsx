import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

// Leva cada papel para a sua área.
export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BOOSTER") redirect("/booster");
  redirect("/orders");
}
