import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PostgrestError } from "@supabase/supabase-js";

import { getCountryOptions, isValidCountryCode } from "@/auth/countries";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SessionSummary } from "@/components/common/SessionSummary";
import { useI18n } from "@/i18n/useI18n";

import "./OnboardingPage.css";

interface OnboardingPageProps {
  locale: "es" | "en";
}

const MIN_ALIAS_LENGTH = 3;
const MAX_ALIAS_LENGTH = 24;
const MAX_BIO_LENGTH = 280;
const MAX_CITY_LENGTH = 120;
const MAX_SCHOOL_LENGTH = 120;
const MIN_BIRTH_YEAR = 1900;

function normalizeAlias(value: string) {
  return value.trim().toLowerCase();
}

function isValidAlias(value: string) {
  return /^[a-z0-9](?:[a-z0-9_-]{2,23})$/.test(value);
}

function toAliasCandidate(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "")
    .replace(/_{2,}/g, "_")
    .slice(0, MAX_ALIAS_LENGTH);
}

function suggestedAliasFromGoogle(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
) {
  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : null;

  if (provider !== "google") {
    return "";
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.given_name as string | undefined) ??
    null;
  const emailPrefix = user.email?.split("@")[0] ?? "";
  const candidate = toAliasCandidate(fullName ?? emailPrefix);

  if (!candidate || candidate.length < MIN_ALIAS_LENGTH) {
    return "";
  }

  return candidate;
}

export function OnboardingPage({ locale }: OnboardingPageProps) {
  const { t } = useI18n(["common"]);
  const { isLoading, saveProfile, user } = useAuth();
  const navigate = useNavigate();
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const currentYear = new Date().getFullYear();
  const [alias, setAlias] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [aliasTouched, setAliasTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const accountEmail = user?.email ?? "";

  const canSubmit = !isLoading && Boolean(user);

  useEffect(() => {
    if (!user || aliasTouched || alias.trim().length > 0) {
      return;
    }

    const suggestedAlias = suggestedAliasFromGoogle(user);

    if (suggestedAlias) {
      setAlias(suggestedAlias);
    }
  }, [alias, aliasTouched, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedAlias = normalizeAlias(alias);

    if (!normalizedAlias) {
      setFormError(t("common:onboarding.aliasRequired"));
      return;
    }

    if (
      normalizedAlias.length < MIN_ALIAS_LENGTH ||
      normalizedAlias.length > MAX_ALIAS_LENGTH ||
      !isValidAlias(normalizedAlias)
    ) {
      setFormError(t("common:onboarding.aliasInvalid"));
      return;
    }

    const trimmedBirthYear = birthYear.trim();
    const hasBirthYear = trimmedBirthYear.length > 0;
    const parsedBirthYear = hasBirthYear ? Number(trimmedBirthYear) : null;

    if (
      hasBirthYear &&
      (parsedBirthYear === null ||
        !Number.isInteger(parsedBirthYear) ||
        parsedBirthYear < MIN_BIRTH_YEAR ||
        parsedBirthYear > currentYear)
    ) {
      setFormError(
        t("common:onboarding.birthYearInvalid", {
          min: MIN_BIRTH_YEAR,
          max: currentYear,
        }),
      );
      return;
    }

    const nextCountryCode = countryCode.trim().toUpperCase();

    if (nextCountryCode && !isValidCountryCode(nextCountryCode)) {
      setFormError(t("common:onboarding.countryInvalid"));
      return;
    }

    const trimmedCity = city.trim();
    if (trimmedCity.length > MAX_CITY_LENGTH) {
      setFormError(
        t("common:onboarding.cityTooLong", { max: MAX_CITY_LENGTH }),
      );
      return;
    }

    const trimmedBio = bio.trim();
    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setFormError(t("common:onboarding.bioTooLong", { max: MAX_BIO_LENGTH }));
      return;
    }

    const trimmedSchoolName = schoolName.trim();
    if (trimmedSchoolName.length > MAX_SCHOOL_LENGTH) {
      setFormError(
        t("common:onboarding.schoolTooLong", { max: MAX_SCHOOL_LENGTH }),
      );
      return;
    }

    try {
      await saveProfile({
        alias: normalizedAlias,
        birthYear: parsedBirthYear,
        countryCode: nextCountryCode || null,
        city: trimmedCity || null,
        bio: trimmedBio || null,
        schoolName: trimmedSchoolName || null,
      });

      navigate(`/${locale}`, { replace: true });
    } catch (caughtError) {
      if (
        caughtError instanceof PostgrestError &&
        caughtError.code === "23505"
      ) {
        setFormError(t("common:onboarding.aliasTaken"));
        return;
      }

      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common:onboarding.genericError"),
      );
    }
  };

  return (
    <main className="onboarding-page">
      <header className="onboarding-page__header">
        <p className="onboarding-page__brand">{t("common:brand.name")}</p>
        <SessionSummary className="onboarding-page__session" locale={locale} />
      </header>

      <Container className="onboarding-page__card">
        <p className="onboarding-page__eyebrow">
          {t("common:onboarding.eyebrow")}
        </p>
        <h1>{t("common:onboarding.title")}</h1>
        {accountEmail ? (
          <p className="onboarding-page__account-email">
            {t("common:onboarding.accountEmailInline", { email: accountEmail })}
          </p>
        ) : null}
        <p className="onboarding-page__intro">
          {t("common:onboarding.description")}
        </p>

        <form className="onboarding-page__form" onSubmit={handleSubmit}>
          <label className="onboarding-page__label" htmlFor="alias">
            {t("common:onboarding.aliasLabel")}
          </label>
          <input
            autoCapitalize="none"
            autoComplete="username"
            className="onboarding-page__input"
            id="alias"
            maxLength={MAX_ALIAS_LENGTH}
            onChange={(event) => {
              setAliasTouched(true);
              setAlias(event.target.value);
            }}
            placeholder={t("common:onboarding.aliasPlaceholder")}
            required
            spellCheck={false}
            type="text"
            value={alias}
          />
          <p className="onboarding-page__hint">
            {t("common:onboarding.aliasHint")}
          </p>

          <label className="onboarding-page__label" htmlFor="birth-year">
            {t("common:onboarding.birthYearLabel")}
          </label>
          <input
            className="onboarding-page__input"
            id="birth-year"
            inputMode="numeric"
            max={currentYear}
            min={MIN_BIRTH_YEAR}
            onChange={(event) => setBirthYear(event.target.value)}
            placeholder={t("common:onboarding.birthYearPlaceholder")}
            type="number"
            value={birthYear}
          />

          <label className="onboarding-page__label" htmlFor="country-code">
            {t("common:onboarding.countryLabel")}
          </label>
          <select
            className="onboarding-page__input"
            id="country-code"
            onChange={(event) => setCountryCode(event.target.value)}
            value={countryCode}
          >
            <option value="">
              {t("common:onboarding.countryPlaceholder")}
            </option>
            {countryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="onboarding-page__label" htmlFor="city">
            {t("common:onboarding.cityLabel")}
          </label>
          <input
            autoComplete="address-level2"
            className="onboarding-page__input"
            id="city"
            maxLength={MAX_CITY_LENGTH}
            onChange={(event) => setCity(event.target.value)}
            placeholder={t("common:onboarding.cityPlaceholder")}
            type="text"
            value={city}
          />

          <label className="onboarding-page__label" htmlFor="bio">
            {t("common:onboarding.bioLabel")}
          </label>
          <textarea
            className="onboarding-page__input onboarding-page__textarea"
            id="bio"
            maxLength={MAX_BIO_LENGTH}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t("common:onboarding.bioPlaceholder")}
            rows={4}
            value={bio}
          />
          <p className="onboarding-page__hint">
            {t("common:onboarding.bioCounter", {
              count: MAX_BIO_LENGTH - bio.length,
            })}
          </p>

          <label className="onboarding-page__label" htmlFor="school-name">
            {t("common:onboarding.schoolLabel")}
          </label>
          <input
            autoComplete="organization"
            className="onboarding-page__input"
            id="school-name"
            maxLength={MAX_SCHOOL_LENGTH}
            onChange={(event) => setSchoolName(event.target.value)}
            placeholder={t("common:onboarding.schoolPlaceholder")}
            type="text"
            value={schoolName}
          />

          <div className="onboarding-page__actions">
            <Button disabled={!canSubmit} type="submit">
              {t("common:actions.completeProfile")}
            </Button>
            <Link
              className="onboarding-page__secondary-link"
              to={`/${locale}/auth`}
            >
              {t("common:actions.backHome")}
            </Link>
          </div>
        </form>

        {formError ? (
          <p className="onboarding-page__error">{formError}</p>
        ) : null}
      </Container>
    </main>
  );
}
