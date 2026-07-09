import { Link } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { useI18n } from "@/i18n/useI18n";

import "./SessionSummary.css";

interface SessionSummaryProps {
  className?: string;
  locale: "es" | "en";
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

export function SessionSummary({ className, locale }: SessionSummaryProps) {
  const { t } = useI18n(["common"]);
  const { hasProfile, isAuthenticated, profile, signOut } = useAuth();
  const authPath = getAuthPath(locale);
  const profilePath = getProfilePath(locale);
  const onboardingPath = getOnboardingPath(locale);
  const classes = ["session-summary", className].filter(Boolean).join(" ");

  if (!isAuthenticated) {
    return (
      <nav className={classes}>
        <Link className="session-summary__link" to={authPath}>
          {t("common:actions.loginOrRegister")}
        </Link>
      </nav>
    );
  }

  return (
    <nav className={classes}>
      <Link
        className="session-summary__link"
        to={hasProfile ? profilePath : onboardingPath}
      >
        {hasProfile && profile?.alias
          ? profile.alias
          : t("common:actions.completeProfile")}
      </Link>
      <button
        className="session-summary__button"
        onClick={() => void signOut()}
        type="button"
      >
        {t("common:actions.signOut")}
      </button>
    </nav>
  );
}
