import { useTranslation } from "react-i18next";

import type { SupportedLanguage } from "@/i18n";
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function useI18n(namespaces?: string | string[]) {
  return useTranslation(namespaces);
}
