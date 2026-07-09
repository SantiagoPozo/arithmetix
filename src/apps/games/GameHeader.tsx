import type { MouseEvent } from "react";
import { Link } from "react-router-dom";

import { GAME_ROUTES, getGamePath, type GameId } from "@/apps/games/routes";
import { useAuth } from "@/auth/useAuth";
import { useI18n } from "@/i18n/useI18n";

interface GameHeaderProps {
  locale: "es" | "en";
  gameId: GameId;
}

function getAuthPath(locale: "es" | "en") {
  return `/${locale}/auth`;
}

function getProfilePath(locale: "es" | "en") {
  return locale === "es" ? `/${locale}/perfil` : `/${locale}/profile`;
}

function getOnboardingPath(locale: "es" | "en") {
  return `/${locale}/onboarding`;
}

export function GameHeader({ locale, gameId }: GameHeaderProps) {
  const { t } = useI18n(["common", "games", "landing"]);
  const { hasProfile, isAuthenticated, profile, signOut } = useAuth();
  const gamePath = getGamePath(locale, gameId);
  const homePath = `/${locale}`;
  const authPath = getAuthPath(locale);
  const profilePath = getProfilePath(locale);
  const onboardingPath = getOnboardingPath(locale);

  const handleSignOut = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    void signOut();
  };

  return (
    <header className="game-page__header">
      <div className="game-page__header-left">
        <Link className="game-page__brand-link" to={homePath}>
          <span className="game-page__brand">{t("common:brand.name")}</span>
        </Link>

        <nav
          aria-label={t("games:navigation.label")}
          className="game-page__nav"
        >
          {GAME_ROUTES.map((route) => {
            const path = getGamePath(locale, route.id);
            const selected = gamePath === path;

            return (
              <Link
                aria-current={selected ? "page" : undefined}
                className="game-page__nav-link"
                key={route.id}
                to={path}
              >
                {t(route.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="game-page__header-right">
        {isAuthenticated ? (
          <nav className="game-page__auth-links">
            <Link
              className="game-page__auth-link"
              to={hasProfile ? profilePath : onboardingPath}
            >
              {hasProfile && profile?.alias
                ? profile.alias
                : t("common:actions.completeProfile")}
            </Link>
            <a
              className="game-page__auth-link"
              href={homePath}
              onClick={handleSignOut}
            >
              {t("common:actions.signOut")}
            </a>
          </nav>
        ) : (
          <nav className="game-page__auth-links">
            <Link className="game-page__auth-link" to={authPath}>
              {t("common:actions.loginOrRegister")}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
