import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { AuthPage } from "@/apps/auth/AuthPage";
import { ForgotPasswordPage } from "@/apps/auth/ForgotPasswordPage";
import { OAuthCallbackPage } from "@/apps/auth/OAuthCallbackPage";
import { ResetPasswordPage } from "@/apps/auth/ResetPasswordPage";
import { IntegerOperationsPage } from "@/apps/games/IntegerOperationsPage";
import { OrderOperationsPage } from "@/apps/games/OrderOperationsPage";
import { SimpleEquationsPage } from "@/apps/games/SimpleEquationsPage";
import { LandingPage } from "@/apps/landing/LandingPage";
import { OnboardingPage } from "@/apps/profile/OnboardingPage";
import { ProfilePage } from "@/apps/profile/ProfilePage";
import { useAuth } from "@/auth/useAuth";
import { Container } from "@/components/common/Container";
import { useI18n, isSupportedLanguage } from "@/i18n/useI18n";

function ClassificationPlaceholder() {
  return null;
}

interface LocaleAwareProps {
  locale: "es" | "en";
}

function RouteStatusPage() {
  const { t } = useI18n(["common"]);

  return (
    <main className="auth-page">
      <Container className="auth-page__card">
        <p className="auth-page__eyebrow">{t("common:onboarding.eyebrow")}</p>
        <h1>{t("common:onboarding.loadingTitle")}</h1>
        <p>{t("common:onboarding.loadingDescription")}</p>
      </Container>
    </main>
  );
}

function ProfileCompletionGate({
  locale,
  children,
}: LocaleAwareProps & {
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading, profileState } = useAuth();

  if (isLoading) {
    return <RouteStatusPage />;
  }

  if (isAuthenticated && profileState === "missing") {
    return <Navigate replace to={`/${locale}/onboarding`} />;
  }

  return <>{children}</>;
}

function OnboardingRoute({ locale }: LocaleAwareProps) {
  const { isAuthenticated, isLoading, hasProfile } = useAuth();

  if (isLoading) {
    return <RouteStatusPage />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to={`/${locale}/auth`} />;
  }

  if (hasProfile) {
    return <Navigate replace to={`/${locale}`} />;
  }

  return <OnboardingPage locale={locale} />;
}

function LocalizedRoutes() {
  const { i18n } = useI18n();
  const location = useLocation();
  const { locale } = useParams();

  const safeLocale = locale && isSupportedLanguage(locale) ? locale : null;

  useEffect(() => {
    if (safeLocale && i18n.language !== safeLocale) {
      void i18n.changeLanguage(safeLocale);
    }
  }, [safeLocale, i18n]);

  if (!safeLocale) {
    const path = location.pathname.startsWith("/en") ? "/en" : "/es";
    return <Navigate replace to={path} />;
  }

  return (
    <Routes>
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <LandingPage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        index
      />
      <Route element={<AuthPage locale={safeLocale} />} path="auth" />
      <Route
        element={<ForgotPasswordPage locale={safeLocale} />}
        path="auth/forgot-password"
      />
      <Route
        element={<OAuthCallbackPage locale={safeLocale} />}
        path="auth/callback"
      />
      <Route
        element={<ResetPasswordPage locale={safeLocale} />}
        path="auth/reset-password"
      />
      <Route
        element={<OnboardingRoute locale={safeLocale} />}
        path="onboarding"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <ProfilePage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        path="perfil"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <ProfilePage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        path="profile"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <IntegerOperationsPage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        path="operaciones-enteros"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <SimpleEquationsPage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        path="ecuaciones-simples"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <OrderOperationsPage locale={safeLocale} />
          </ProfileCompletionGate>
        }
        path="orden-operaciones"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <ClassificationPlaceholder />
          </ProfileCompletionGate>
        }
        path="clasificacion"
      />
      <Route
        element={
          <ProfileCompletionGate locale={safeLocale}>
            <ClassificationPlaceholder />
          </ProfileCompletionGate>
        }
        path="leaderboard"
      />
      <Route element={<Navigate replace to={`/${safeLocale}`} />} path="*" />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/es" />} path="/" />
        <Route element={<Navigate replace to="/es/auth" />} path="/auth" />
        <Route
          element={<Navigate replace to="/es/auth/forgot-password" />}
          path="/auth/forgot-password"
        />
        <Route
          element={<Navigate replace to="/es/auth/callback" />}
          path="/auth/callback"
        />
        <Route
          element={<Navigate replace to="/es/auth/reset-password" />}
          path="/auth/reset-password"
        />
        <Route element={<LocalizedRoutes />} path="/:locale/*" />
        <Route element={<Navigate replace to="/es" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
