import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { H1, H2, Muted, Stack } from "@/ui/primitives";

export const metadata: Metadata = { title: "Termos de uso" };

// MODELO: revise este texto com um advogado antes de operar de verdade.
export default function TermsPage() {
  return (
    <Stack $gap={28} style={{ maxWidth: 680, margin: "0 auto" }}>
      <H1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>Termos de uso</H1>
      <Muted>Este é um texto-modelo. Revise com um profissional antes de colocar a plataforma no ar.</Muted>
      <Stack $gap={8}>
        <H2>O serviço</H2>
        <p>{BRAND.name} conecta clientes a boosters independentes de World of Warcraft PvP. A plataforma não é afiliada à Blizzard Entertainment.</p>
      </Stack>
      <Stack $gap={8}>
        <H2>Pagamento e retenção</H2>
        <p>O valor do pedido fica retido pela plataforma e só é repassado ao booster depois que o cliente confirma a conclusão do serviço.</p>
      </Stack>
      <Stack $gap={8}>
        <H2>Confirmação e disputas</H2>
        <p>Quando o booster marca o pedido como concluído, o cliente confere e confirma. Se houver problema, qualquer parte pode abrir uma disputa, que será analisada pela equipe.</p>
      </Stack>
      <Stack $gap={8}>
        <H2>Riscos do jogo</H2>
        <p>O cliente entende que serviços dentro do jogo podem violar os termos da Blizzard e que sanções na conta são de sua responsabilidade.</p>
      </Stack>
    </Stack>
  );
}
