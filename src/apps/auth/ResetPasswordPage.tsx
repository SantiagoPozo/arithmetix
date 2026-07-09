import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { useI18n } from "@/i18n/useI18n";

import "./AuthPage.css";

interface ResetPasswordPageProps {
  locale: "es" | "en";
}

const MIN_PASSWORD_LENGTH = 6;

export function ResetPasswordPage({ locale }: ResetPasswordPageProps) {
  const { t } = useI18n(["common"]);
  const { hasProfile, isAuthenticated, isLoading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const error = searchParams.get("error_description");

  useEffect(() => {
    if (message && isAuthenticated) {
      const nextPath = hasProfile ? `/${locale}` : `/${locale}/onboarding`;
      navigate(nextPath, { replace: true });
    }
  }, [hasProfile, isAuthenticated, locale, message, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMessage(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(
        t("common:auth.passwordMinLength", { min: MIN_PASSWORD_LENGTH }),
      );
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t("common:auth.passwordsDoNotMatch"));
      return;
    }

    try {
      await updatePassword(password);
      setMessage(t("common:auth.passwordUpdated"));
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
        {error ? (
          <>
            <h1>{t("common:auth.errorTitle")}</h1>
            <p className="auth-page__error">{error}</p>
          </>
        ) : (
          <>
            <h1>{t("common:auth.resetPasswordTitle")}</h1>
            <p className="auth-page__copy">
              {t("common:auth.resetPasswordDescription")}
            </p>

            {!isAuthenticated ? (
              <p className="auth-page__error">
                {t("common:auth.resetPasswordSessionMissing")}
              </p>
            ) : (
              <form className="auth-page__form" onSubmit={handleSubmit}>
                <label className="auth-page__label" htmlFor="new-password">
                  {t("common:auth.newPasswordLabel")}
                </label>
                <input
                  autoComplete="new-password"
                  className="auth-page__input"
                  id="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("common:auth.passwordPlaceholder")}
                  required
                  type="password"
                  value={password}
                />

                <label
                  className="auth-page__label"
                  htmlFor="confirm-new-password"
                >
                  {t("common:auth.confirmPasswordLabel")}
                </label>
                <input
                  autoComplete="new-password"
                  className="auth-page__input"
                  id="confirm-new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t("common:auth.confirmPasswordPlaceholder")}
                  required
                  type="password"
                  value={confirmPassword}
                />

                <Button disabled={isLoading} type="submit">
                  {t("common:actions.updatePassword")}
                </Button>
              </form>
            )}
          </>
        )}

        {message ? <p className="auth-page__message">{message}</p> : null}
        {formError ? <p className="auth-page__error">{formError}</p> : null}
      </Container>
    </main>
  );
}
