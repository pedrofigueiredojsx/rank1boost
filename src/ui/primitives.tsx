"use client";

import Link from "next/link";
import styled, { css } from "styled-components";
import { color, font, from, radius } from "./theme";

// ───────────── Layout ─────────────

export const Container = styled.div`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const Stack = styled.div<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => $gap}px;
`;

export const Row = styled.div<{ $gap?: number; $align?: string; $justify?: string; $wrap?: boolean }>`
  display: flex;
  flex-wrap: ${({ $wrap = true }) => ($wrap ? "wrap" : "nowrap")};
  align-items: ${({ $align = "center" }) => $align};
  justify-content: ${({ $justify = "flex-start" }) => $justify};
  gap: ${({ $gap = 12 }) => $gap}px;
`;

// Uma coluna no celular; várias colunas (definidas em $cols) a partir de 860px.
export const Grid = styled.div<{ $cols: string; $gap?: number; $align?: string }>`
  display: grid;
  gap: ${({ $gap = 24 }) => $gap}px;
  align-items: ${({ $align = "start" }) => $align};
  ${from.md} {
    grid-template-columns: ${({ $cols }) => $cols};
  }
`;

// ───────────── Texto ─────────────

export const H1 = styled.h1`
  font-family: ${font.heading};
  font-weight: 800;
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
`;

export const H2 = styled.h2`
  font-family: ${font.heading};
  font-weight: 800;
  font-size: clamp(1.7rem, 3.5vw, 2.3rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

export const H3 = styled.h3`
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.2;
`;

export const Lead = styled.p`
  font-size: 1.15rem;
  color: ${color.muted};
  max-width: 34rem;
`;

export const Muted = styled.p`
  color: ${color.muted};
`;

export const Small = styled.span`
  font-size: 0.85rem;
  color: ${color.muted};
`;

// Rótulo pequeno em caixa alta, com um quadradinho amarelo (a assinatura visual do site).
export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${color.gold};
  &::before {
    content: "";
    width: 10px;
    height: 10px;
    background: ${color.gold};
  }
`;

export const Num = styled.span`
  font-variant-numeric: tabular-nums;
`;

export const Money = styled.span<{ $size?: string }>`
  font-family: ${font.heading};
  font-weight: 800;
  font-size: ${({ $size = "1.4rem" }) => $size};
  color: ${color.gold};
  font-variant-numeric: tabular-nums;
`;

export const TextLink = styled(Link)`
  color: ${color.gold};
  text-decoration: underline;
  text-underline-offset: 3px;
`;

export const ExtLink = styled.a`
  color: ${color.gold};
  text-decoration: underline;
  text-underline-offset: 3px;
  word-break: break-all;
`;

// ───────────── Superfícies ─────────────

export const Panel = styled.section<{ $pad?: number }>`
  background: ${color.surface};
  border-radius: ${radius};
  padding: ${({ $pad = 0 }) => $pad}px;
  overflow: hidden;
`;

// Lista dentro de um painel, com linhas finas entre os itens.
export const ListPanel = styled.ul`
  background: ${color.surface};
  border-radius: ${radius};
  overflow: hidden;
  & > li + li {
    border-top: 1px solid ${color.line};
  }
`;

export const Notice = styled.p<{ $tone?: "error" | "ok" }>`
  padding: 14px 16px;
  border-radius: ${radius};
  background: ${color.raised};
  border-left: 4px solid ${({ $tone = "error" }) => ($tone === "ok" ? color.success : color.danger)};
`;

// ───────────── Botões ─────────────

type Variant = "primary" | "ghost" | "danger";

const buttonStyles = css<{ $variant?: Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid transparent;
  border-radius: ${radius};
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 120ms, border-color 120ms, color 120ms;

  ${({ $variant = "primary" }) =>
    $variant === "primary"
      ? css`
          background: ${color.gold};
          color: ${color.onGold};
          &:hover:not(:disabled) { background: ${color.goldHover}; }
        `
      : $variant === "danger"
        ? css`
            background: transparent;
            border-color: ${color.danger};
            color: ${color.danger};
            &:hover:not(:disabled) { background: ${color.danger}; color: ${color.onGold}; }
          `
        : css`
            background: transparent;
            border-color: ${color.line};
            color: ${color.text};
            &:hover:not(:disabled) { border-color: ${color.gold}; color: ${color.gold}; }
          `}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const Button = styled.button<{ $variant?: Variant }>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<{ $variant?: Variant }>`
  ${buttonStyles}
`;

// ───────────── Formulários ─────────────

const controlStyles = css`
  width: 100%;
  padding: 12px 14px;
  background: ${color.bg};
  border: 2px solid ${color.line};
  border-radius: ${radius};
  &:focus { border-color: ${color.gold}; outline: none; }
  &:disabled { opacity: 0.5; }
  &::placeholder { color: ${color.muted}; opacity: 0.7; }
`;

export const Input = styled.input`
  ${controlStyles}
`;
export const Select = styled.select`
  ${controlStyles}
`;
export const Textarea = styled.textarea`
  ${controlStyles}
  resize: vertical;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.9rem;
`;

export const Legend = styled.legend`
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0;
`;

export const Fieldset = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
`;

export const Hint = styled.p`
  margin-top: 6px;
  font-size: 0.8rem;
  color: ${color.muted};
`;

export const ErrorText = styled.p`
  margin-top: 6px;
  font-size: 0.85rem;
  color: ${color.danger};
`;

export const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  & input { accent-color: ${color.gold}; width: 18px; height: 18px; }
`;

export const FormCard = styled.form<{ $max?: number }>`
  width: 100%;
  max-width: ${({ $max = 520 }) => $max}px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
  background: ${color.surface};
  border-radius: ${radius};
`;

// ───────────── Detalhes ─────────────

export const Badge = styled.span<{ $tone?: "gold" | "info" | "success" | "danger" | "muted" }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${color.raised};
  color: ${({ $tone = "muted" }) => ({ gold: color.gold, info: color.info, success: color.success, danger: color.danger, muted: color.muted })[$tone]};
`;

export const DefRow = styled.div`
  display: grid;
  gap: 2px;
  padding: 12px 0;
  & + & { border-top: 1px solid ${color.line}; }
  ${from.sm} { grid-template-columns: 11rem 1fr; gap: 16px; }
  & > dt { color: ${color.muted}; font-size: 0.9rem; }
`;

export const RowLink = styled(Link)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
  padding: 16px 20px;
  transition: background-color 120ms;
  &:hover { background: ${color.raised}; }
`;

export const RowItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 16px 20px;
`;

export const Grow = styled.div`
  flex: 1;
  min-width: 0;
`;

export const PageTitle = styled.h1`
  font-family: ${font.heading};
  font-weight: 800;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
`;
