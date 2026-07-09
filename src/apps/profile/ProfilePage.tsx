import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { getCountryOptions, isValidCountryCode } from "@/auth/countries";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SessionSummary } from "@/components/common/SessionSummary";
import { useI18n } from "@/i18n/useI18n";

import "./ProfilePage.css";

interface ProfilePageProps {
  locale: "es" | "en";
}

const MAX_BIO_LENGTH = 280;
const MAX_CITY_LENGTH = 120;
const MAX_SCHOOL_LENGTH = 120;

export function ProfilePage({ locale }: ProfilePageProps) {
  const { t } = useI18n(["common"]);
  const { isLoading, profile, saveProfile, user } = useAuth();
  const homePath = `/${locale}`;
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCountryCode(profile?.countryCode ?? "");
    setCity(profile?.city ?? "");
    setBio(profile?.bio ?? "");
    setSchoolName(profile?.schoolName ?? "");
  }, [profile]);

  const countryLabel = useMemo(() => {
    if (!profile?.countryCode) {
      return null;
    }

    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(profile.countryCode) ?? profile.countryCode;
  }, [locale, profile?.countryCode]);

  const canSave = Boolean(profile) && !isLoading;

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!profile) {
      setSaveError(t("common:profile.saveError"));
      return;
    }

    const nextCountryCode = countryCode.trim().toUpperCase();

    if (nextCountryCode && !isValidCountryCode(nextCountryCode)) {
      setSaveError(t("common:onboarding.countryInvalid"));
      return;
    }

    const trimmedCity = city.trim();
    if (trimmedCity.length > MAX_CITY_LENGTH) {
      setSaveError(
        t("common:onboarding.cityTooLong", { max: MAX_CITY_LENGTH }),
      );
      return;
    }

    const trimmedBio = bio.trim();
    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setSaveError(t("common:onboarding.bioTooLong", { max: MAX_BIO_LENGTH }));
      return;
    }

    const trimmedSchoolName = schoolName.trim();
    if (trimmedSchoolName.length > MAX_SCHOOL_LENGTH) {
      setSaveError(
        t("common:onboarding.schoolTooLong", { max: MAX_SCHOOL_LENGTH }),
      );
      return;
    }

    try {
      await saveProfile({
        alias: profile.alias,
        birthYear: profile.birthYear,
        countryCode: nextCountryCode || null,
        city: trimmedCity || null,
        bio: trimmedBio || null,
        schoolName: trimmedSchoolName || null,
      });
      setSaveSuccess(t("common:profile.saveSuccess"));
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error
          ? caughtError.message
          : t("common:profile.saveError"),
      );
    }
  };

  return (
    <main className="profile-page">
      <header className="profile-page__header">
        <div>
          <p className="profile-page__brand">{t("common:brand.name")}</p>
          <Link className="profile-page__back" to={homePath}>
            {t("common:actions.backHome")}
          </Link>
        </div>

        <SessionSummary className="profile-page__session" locale={locale} />
      </header>

      <Container className="profile-page__card">
        <p className="profile-page__eyebrow">{t("common:profile.eyebrow")}</p>
        <h1>{profile?.alias ?? t("common:profile.title")}</h1>
        <p className="profile-page__intro">{t("common:profile.description")}</p>

        <dl className="profile-page__grid">
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.alias")}</dt>
            <dd>{profile?.alias ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.email")}</dt>
            <dd>{user?.email ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.birthYear")}</dt>
            <dd>{profile?.birthYear ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.country")}</dt>
            <dd>{countryLabel ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.city")}</dt>
            <dd>{profile?.city ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.school")}</dt>
            <dd>{profile?.schoolName ?? "-"}</dd>
          </div>
          <div className="profile-page__item">
            <dt>{t("common:profile.fields.bio")}</dt>
            <dd>{profile?.bio ?? "-"}</dd>
          </div>
        </dl>

        <section className="profile-page__edit-block">
          <h2>{t("common:profile.editTitle")}</h2>
          <p>{t("common:profile.editDescription")}</p>

          <form className="profile-page__form" onSubmit={handleSaveProfile}>
            <label className="profile-page__label" htmlFor="profile-country">
              {t("common:profile.fields.country")}
            </label>
            <select
              className="profile-page__input"
              id="profile-country"
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

            <label className="profile-page__label" htmlFor="profile-city">
              {t("common:profile.fields.city")}
            </label>
            <input
              className="profile-page__input"
              id="profile-city"
              maxLength={MAX_CITY_LENGTH}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t("common:onboarding.cityPlaceholder")}
              type="text"
              value={city}
            />

            <label className="profile-page__label" htmlFor="profile-school">
              {t("common:profile.fields.school")}
            </label>
            <input
              className="profile-page__input"
              id="profile-school"
              maxLength={MAX_SCHOOL_LENGTH}
              onChange={(event) => setSchoolName(event.target.value)}
              placeholder={t("common:onboarding.schoolPlaceholder")}
              type="text"
              value={schoolName}
            />

            <label className="profile-page__label" htmlFor="profile-bio">
              {t("common:profile.fields.bio")}
            </label>
            <textarea
              className="profile-page__input profile-page__textarea"
              id="profile-bio"
              maxLength={MAX_BIO_LENGTH}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t("common:onboarding.bioPlaceholder")}
              rows={4}
              value={bio}
            />

            <Button disabled={!canSave} type="submit">
              {t("common:actions.updateProfile")}
            </Button>
          </form>

          {saveSuccess ? (
            <p className="profile-page__success">{saveSuccess}</p>
          ) : null}
          {saveError ? (
            <p className="profile-page__error">{saveError}</p>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
