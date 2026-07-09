import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { useI18n } from "@/i18n/useI18n";

import "./AuthPage.css";

type AuthMode = "register" | "login";

interface AuthPageProps {
  locale: "es" | "en";
}

export function AuthPage({ locale }: AuthPageProps) {
  const { t } = useI18n(["common"]);
  const {
    isAuthenticated,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithMagicLink,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const googleCallbackPath = `${window.location.origin}/${locale}/auth/callback`;

  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const callbackError =
    typeof location.state === "object" && location.state !== null
      ? Reflect.get(location.state, "authError")
      : null;
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const displayedError =
    formError ?? (typeof callbackError === "string" ? callbackError : null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${locale}`, { replace: true });
    }
  }, [isAuthenticated, locale, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    try {
      if (mode === "register") {
        await signUpWithEmail(email, password);
        setMessage(t("common:auth.checkEmail"));
        return;
      }

      await signInWithEmail(email, password);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common:auth.genericError"),
      );
    }
  };

  const handleGoogleAuth = async () => {
    setFormError(null);
    setMessage(null);

    try {
      await signInWithGoogle(googleCallbackPath);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common:auth.genericError"),
      );
    }
  };

  const handleMagicLinkAuth = async () => {
    setFormError(null);
    setMessage(null);

    if (!email.trim()) {
      setFormError(t("common:auth.magicLinkRequiresEmail"));
      return;
    }

    try {
      await signInWithMagicLink(email, googleCallbackPath);
      setMessage(t("common:auth.magicLinkSent"));
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common:auth.genericError"),
      );
    }
  };

  return (
    <main className="auth-page">
      <header className="auth-page__header">
        <p className="auth-page__brand">{t("common:brand.name")}</p>
        <Link className="auth-page__back" to={`/${locale}`}>
          {t("common:actions.backHome")}
        </Link>
      </header>

      <Container className="auth-page__card">
        <p className="auth-page__eyebrow">{t("common:auth.title")}</p>
        <h1>{t("common:auth.subtitle")}</h1>

        <div className="auth-page__mode-toggle" role="tablist">
          <button
            aria-selected={mode === "register"}
            className="auth-page__mode-button"
            onClick={() => setMode("register")}
            type="button"
          >
            {t("common:actions.createAccount")}
          </button>
          <button
            aria-selected={mode === "login"}
            className="auth-page__mode-button"
            onClick={() => setMode("login")}
            type="button"
          >
            {t("common:actions.login")}
          </button>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__label" htmlFor="email">
            {t("common:auth.emailLabel")}
          </label>
          <input
            className="auth-page__input"
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("common:auth.emailPlaceholder")}
            required
            type="email"
            value={email}
          />

          <label className="auth-page__label" htmlFor="password">
            {t("common:auth.passwordLabel")}
          </label>
          <input
            className="auth-page__input"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            id="password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("common:auth.passwordPlaceholder")}
            required
            type="password"
            value={password}
          />

          <Button disabled={isLoading} type="submit">
            {mode === "register"
              ? t("common:actions.createAccount")
              : t("common:actions.login")}
          </Button>

          {mode === "login" ? (
            <Link
              className="auth-page__link"
              to={`/${locale}/auth/forgot-password`}
            >
              {t("common:actions.forgotPassword")}
            </Link>
          ) : null}
        </form>

        <p className="auth-page__separator">{t("common:auth.or")}</p>

        {mode === "login" ? (
          <Button
            disabled={isLoading}
            onClick={() => void handleMagicLinkAuth()}
            variant="secondary"
          >
            {t("common:actions.signInMagicLink")}
          </Button>
        ) : null}

        {mode === "login" ? (
          <p className="auth-page__helper-copy">
            {t("common:auth.magicLinkDescription")}
          </p>
        ) : null}

        <Button
          disabled={isLoading}
          onClick={() => void handleGoogleAuth()}
          variant="secondary"
        >
          {t("common:actions.signInGoogle")}
        </Button>

        {message ? <p className="auth-page__message">{message}</p> : null}
        {displayedError ? (
          <p className="auth-page__error">{displayedError}</p>
        ) : null}
      </Container>
    </main>
  );
}
