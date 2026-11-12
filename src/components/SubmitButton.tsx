"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/ui/primitives";

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" $variant={variant} disabled={pending}>
      {pending ? "Aguarde..." : children}
    </Button>
  );
}
