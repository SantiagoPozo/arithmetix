import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/i18n/locales/en/common.json";
import enGames from "@/i18n/locales/en/games.json";
import enLanding from "@/i18n/locales/en/landing.json";
import esCommon from "@/i18n/locales/es/common.json";
import esGames from "@/i18n/locales/es/games.json";
import esLanding from "@/i18n/locales/es/landing.json";

export const DEFAULT_LANGUAGE = "es";
export const SUPPORTED_LANGUAGES = ["es", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  es: {
    common: esCommon,
    landing: esLanding,
    games: esGames,
  },
  en: {
    common: enCommon,
    landing: enLanding,
    games: enGames,
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: ["common", "landing", "games"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
