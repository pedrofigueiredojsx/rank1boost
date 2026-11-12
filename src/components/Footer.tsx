import { getDict } from "@/lib/i18n";
import { Container } from "@/ui/primitives";
import { FooterBar } from "@/ui/shell";
import { NavLink } from "@/ui/shell";

export async function Footer() {
  const { t } = await getDict();
  return (
    <FooterBar>
      <Container>
        <NavLink href="/terms">{t.footer.terms}</NavLink>
        <span>{t.footer.disclaimer}</span>
      </Container>
    </FooterBar>
  );
}
