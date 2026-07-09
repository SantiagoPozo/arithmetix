import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { useI18n } from "@/i18n/useI18n";

import "./AuthPage.css";

interface ForgotPasswordPageProps {
  locale: "es" | "en";
}

export function ForgotPasswordPage({ locale }: ForgotPasswordPageProps) {
  const { t } = useI18n(["common"]);
  const { isLoading, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = `${window.location.origin}/${locale}/auth/reset-password`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    try {
      await requestPasswordReset(email, redirectTo);
      setMessage(t("common:auth.passwordResetEmailSent"));
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
        <Link className="auth-page__back" to={`/${locale}/auth`}>
          {t("common:actions.backToLogin")}
        </Link>
      </header>

      <Container className="auth-page__card">
        <p className="auth-page__eyebrow">
          {t("common:auth.passwordRecovery")}
        </p>
        <h1>{t("common:auth.passwordRecoveryTitle")}</h1>
        <p className="auth-page__copy">
          {t("common:auth.passwordRecoveryDescription")}
        </p>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__label" htmlFor="recovery-email">
            {t("common:auth.emailLabel")}
          </label>
          <input
            autoComplete="email"
            className="auth-page__input"
            id="recovery-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("common:auth.emailPlaceholder")}
            required
            type="email"
            value={email}
          />

          <Button disabled={isLoading} type="submit">
            {t("common:actions.sendResetLink")}
          </Button>
        </form>

        {message ? <p className="auth-page__message">{message}</p> : null}
        {formError ? <p className="auth-page__error">{formError}</p> : null}
      </Container>
    </main>
  );
}
