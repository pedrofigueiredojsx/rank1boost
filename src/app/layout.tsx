import type { Metadata } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/inter";
import { BRAND } from "@/lib/constants";
import { getLocale } from "@/lib/i18n";
import StyledComponentsRegistry from "@/ui/registry";
import { GlobalStyle } from "@/ui/global";
import { PageMain } from "@/ui/shell";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description:
    "WoW PvP boosting: arena and RBG boost, pilot, coaching and hourly booster rental. / Boost, coach e aluguel de booster para PvP de WoW.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale === "en" ? "en" : "pt-BR"}>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <Header />
          <PageMain>{children}</PageMain>
          <Footer />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
