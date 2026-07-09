import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { GAME_ROUTES, getGamePath } from "@/apps/games/routes";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SessionSummary } from "@/components/common/SessionSummary";
import { useI18n } from "@/i18n/useI18n";

import "./LandingPage.css";

interface LandingPageProps {
  locale: "es" | "en";
}

export function LandingPage({ locale }: LandingPageProps) {
  const { t } = useI18n(["common", "landing"]);
  const [name, setName] = useState("");
  const gameExamples = useMemo(
    () =>
      GAME_ROUTES.map((gameRoute) => ({
        id: gameRoute.id,
        label: t(gameRoute.labelKey),
        path: getGamePath(locale, gameRoute.id),
      })),
    [locale, t],
  );

  return (
    <main className="landing">
      <header className="landing__header">
        <p className="landing__brand">{t("common:brand.name")}</p>
        <SessionSummary className="landing__nav" locale={locale} />
      </header>

      <section className="landing__hero">
        <p className="landing__eyebrow">{t("landing:hero.eyebrow")}</p>
        <h1>{t("landing:hero.title")}</h1>
        <p className="landing__subtitle">{t("landing:hero.subtitle")}</p>

        <div className="landing__cta-row">
          <Link to={gameExamples[0]?.path ?? `/${locale}`}>
            <Button size="lg">{t("common:actions.playNow")}</Button>
          </Link>
        </div>
      </section>

      <section className="landing__grid">
        <Container>
          <h2>{t("landing:highlights.title")}</h2>
          <ul className="landing__list">
            <li>
              <strong>{t("landing:highlights.items.clock.title")}</strong>
              <p>{t("landing:highlights.items.clock.text")}</p>
            </li>
            <li>
              <strong>{t("landing:highlights.items.learn.title")}</strong>
              <p>{t("landing:highlights.items.learn.text")}</p>
            </li>
            <li>
              <strong>{t("landing:highlights.items.cloud.title")}</strong>
              <p>{t("landing:highlights.items.cloud.text")}</p>
            </li>
          </ul>
        </Container>

        <Container variant="soft">
          <h2>{t("landing:featured.title")}</h2>
          <ul className="landing__list landing__list--games">
            {gameExamples.map((game) => (
              <li key={game.id}>
                <Link className="landing__game-link" to={game.path}>
                  {game.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="landing__profile">
            <input
              className="landing__input"
              maxLength={32}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                locale === "es" ? "Tu nombre de jugador" : "Your player name"
              }
              value={name}
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
