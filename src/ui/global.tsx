"use client";

import { createGlobalStyle } from "styled-components";
import { color, font } from "./theme";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
  body {
    margin: 0;
    min-height: 100vh;
    background: ${color.bg};
    color: ${color.text};
    font-family: ${font.body};
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, p, ul, ol, dl, dd, figure { margin: 0; }
  ul, ol { padding: 0; list-style: none; }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; color: inherit; }
  img, svg { display: block; max-width: 100%; }
  :focus-visible { outline: 3px solid ${color.gold}; outline-offset: 2px; }
  ::selection { background: ${color.gold}; color: ${color.onGold}; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;
