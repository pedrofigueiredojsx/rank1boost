"use client";

import Link from "next/link";
import styled from "styled-components";
import { color, font, from } from "./theme";

export const HeaderBar = styled.header`
  border-bottom: 1px solid ${color.line};
`;

export const HeaderInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
  padding-top: 14px;
  padding-bottom: 14px;
`;

export const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: ${font.heading};
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
`;

export const LogoMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${color.gold};
  color: ${color.onGold};
  font-size: 0.95rem;
  letter-spacing: -0.04em;
`;

export const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  font-size: 0.9rem;
  color: ${color.muted};
`;

export const NavLink = styled(Link)`
  &:hover { color: ${color.text}; }
`;

export const HeaderActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
`;

export const LocaleButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: 0;
  padding: 4px;
  cursor: pointer;
  font-weight: 700;
  color: ${({ $active }) => ($active ? color.gold : color.muted)};
  &:hover { color: ${color.text}; }
`;

export const PlainButton = styled.button`
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: ${color.muted};
  &:hover { color: ${color.text}; }
`;

export const PageMain = styled.main`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 0;
`;

export const FooterBar = styled.footer`
  margin-top: 96px;
  border-top: 1px solid ${color.line};
  & > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    padding-top: 24px;
    padding-bottom: 32px;
    font-size: 0.85rem;
    color: ${color.muted};
  }
  ${from.md} { margin-top: 120px; }
`;
