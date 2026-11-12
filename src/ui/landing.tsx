"use client";

import Link from "next/link";
import styled from "styled-components";
import { color, font, from, radius } from "./theme";

export const Hero = styled.section`
  display: grid;
  gap: 48px;
  align-items: center;
  padding: 24px 0 8px;
  ${from.md} { grid-template-columns: 1.15fr 0.85fr; }
`;

export const Section = styled.section`
  margin-top: 96px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  scroll-margin-top: 24px;
`;

// Gráfico plano do pódio: o 1º lugar em amarelo.
const PodiumBox = styled.figure`
  background: ${color.surface};
  border-radius: ${radius};
  padding: 28px 28px 20px;
`;
const Bars = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  align-items: end;
  gap: 10px;
  height: 260px;
`;
const Bar = styled.div<{ $h: number; $gold?: boolean }>`
  height: ${({ $h }) => $h}%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14px;
  border-radius: 8px 8px 0 0;
  background: ${({ $gold }) => ($gold ? color.gold : color.raised)};
  color: ${({ $gold }) => ($gold ? color.onGold : color.muted)};
  font-family: ${font.heading};
  font-weight: 800;
  font-size: ${({ $gold }) => ($gold ? "3.4rem" : "2.2rem")};
  line-height: 1;
`;
const PodiumCaption = styled.figcaption`
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid ${color.line};
  font-size: 0.85rem;
  color: ${color.muted};
`;

export function Podium({ label }: { label: string }) {
  return (
    <PodiumBox role="img" aria-label={label}>
      <Bars aria-hidden="true">
        <Bar $h={58}>2</Bar>
        <Bar $h={100} $gold>1</Bar>
        <Bar $h={40}>3</Bar>
      </Bars>
      <PodiumCaption>{label}</PodiumCaption>
    </PodiumBox>
  );
}

// Linha do catálogo de serviços.
export const ServiceRow = styled.li`
  display: grid;
  gap: 12px;
  align-items: center;
  padding: 18px 20px;
  ${from.md} { grid-template-columns: 1fr auto 11rem auto; gap: 24px; }
`;

export const ServicePrice = styled.p`
  ${from.md} { text-align: right; }
`;

// Níveis de booster: cada linha entra um pouco mais, como degraus.
export const TierRow = styled.div<{ $step: number }>`
  display: grid;
  gap: 4px;
  padding: 18px 20px 18px ${({ $step }) => 20 + $step * 20}px;
  ${from.md} { grid-template-columns: 11rem 1fr; gap: 20px; align-items: baseline; }
  & > dt { font-family: ${font.heading}; font-weight: 800; font-size: 1.25rem; }
  & > dd { color: ${color.muted}; margin: 0; }
  &:last-child > dt { color: ${color.gold}; }
`;
export const TierList = styled.dl`
  background: ${color.surface};
  border-radius: ${radius};
  overflow: hidden;
  & > div + div { border-top: 1px solid ${color.line}; }
`;

export const Steps = styled.ol`
  display: grid;
  gap: 28px 48px;
  ${from.md} { grid-template-columns: 1fr 1fr; }
`;
export const Step = styled.li`
  display: flex;
  gap: 18px;
`;
export const StepNum = styled.span`
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${color.gold};
  color: ${color.onGold};
  font-family: ${font.heading};
  font-weight: 800;
  font-size: 1.3rem;
`;

export const HeroLink = styled(Link)`
  text-decoration: underline;
`;
