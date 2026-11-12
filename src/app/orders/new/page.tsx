import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { OrderForm } from "@/components/OrderForm";

export const metadata: Metadata = { title: "Novo pedido" };

export default async function NewOrderPage({ searchParams }: PageProps<"/orders/new">) {
  await requireRole("CLIENT");

  const slug = (await searchParams).service;
  if (typeof slug !== "string") redirect("/#services");

  const service = await prisma.service.findFirst({ where: { slug, active: true } });
  if (!service) notFound();

  return (
    <OrderForm
      service={{
        id: service.id,
        name: service.name,
        pricingModel: service.pricingModel,
        priceCents: service.priceCents,
        currency: service.currency,
        noGearSurchargeBps: service.noGearSurchargeBps,
      }}
    />
  );
}
