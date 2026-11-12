import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para o styled-components funcionar bem no Next (SSR e nomes de classe legíveis em dev).
  compiler: { styledComponents: true },
  // Cache Components (cacheComponents) está desligado de propósito: o app é autenticado e dinâmico,
  // e o modo clássico é mais simples de aprender. Migrar depois é um bom exercício.
};

export default nextConfig;
