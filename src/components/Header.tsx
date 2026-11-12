import { BRAND } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { logout, setLocale } from "@/app/actions/auth";
import { Container, ButtonLink } from "@/ui/primitives";
import {
  HeaderActions, HeaderBar, HeaderInner, LocaleButton, LogoLink, LogoMark, Nav, NavLink, PlainButton,
} from "@/ui/shell";

export async function Header() {
  const [user, { t, locale }] = await Promise.all([getCurrentUser(), getDict()]);

  return (
    <HeaderBar>
      <Container>
        <HeaderInner>
          <LogoLink href="/">
            <LogoMark>R1</LogoMark>
            {BRAND.name}
          </LogoLink>

          <Nav aria-label="Principal">
            <NavLink href="/#services">{t.nav.services}</NavLink>
            <NavLink href="/#tiers">{t.nav.tiers}</NavLink>
            <NavLink href="/#how">{t.nav.how}</NavLink>
          </Nav>

          <HeaderActions>
            <form action={setLocale}>
              <LocaleButton name="locale" value="pt" $active={locale === "pt"}>PT</LocaleButton>
              <LocaleButton name="locale" value="en" $active={locale === "en"}>EN</LocaleButton>
            </form>

            {user ? (
              <>
                <ButtonLink href="/dashboard" $variant="ghost">{t.nav.dashboard}</ButtonLink>
                <form action={logout}>
                  <PlainButton>{t.nav.logout}</PlainButton>
                </form>
              </>
            ) : (
              <>
                <NavLink href="/login">{t.nav.login}</NavLink>
                <ButtonLink href="/signup">{t.nav.signup}</ButtonLink>
              </>
            )}
          </HeaderActions>
        </HeaderInner>
      </Container>
    </HeaderBar>
  );
}
