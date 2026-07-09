import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Container } from "@/components/common/Container";
import { useI18n } from "@/i18n/useI18n";

interface OAuthCallbackPageProps {
  locale: "es" | "en";
}

export function OAuthCallbackPage({ locale }: OAuthCallbackPageProps) {
  const { t } = useI18n(["common"]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const error = searchParams.get("error_description");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${locale}`, { replace: true });
    }
  }, [isAuthenticated, locale, navigate]);

  return (
    <main className="auth-page">
      <Container className="auth-page__card">
        <p className="auth-page__eyebrow">{t("common:auth.title")}</p>
        {error ? (
          <>
            <h1>{t("common:auth.errorTitle")}</h1>
            <p className="auth-page__error">{error}</p>
            <div className="auth-page__actions">
              <Link
                className="button button--secondary button--md"
                to={`/${locale}/auth`}
              >
                {t("common:actions.tryAgain")}
              </Link>
              <Link className="button button--primary button--md" to={`/${locale}`}>
                {t("common:actions.goHome")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1>{t("common:auth.finishingGoogle")}</h1>
            <p>{t("common:auth.finishingGoogleDescription")}</p>
          </>
        )}
      </Container>
    </main>
  );
}
