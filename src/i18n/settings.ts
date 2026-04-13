export const defaultLanguage = "es";
export const fallbackLanguage = "es";
export const supportedLanguages = ["es", "he"] as const;
export const languageStorageKey = "trading-journal-language";
export const languageCookieName = "trading-journal-language";

export type AppLanguage = (typeof supportedLanguages)[number];
export type AppLocale = "es" | "he-IL";
export type AppDirection = "ltr" | "rtl";

export const languageNames: Record<AppLanguage, string> = {
  es: "Español",
  he: "עברית",
};

const localeByLanguage: Record<AppLanguage, AppLocale> = {
  es: "es",
  he: "he-IL",
};

const directionByLanguage: Record<AppLanguage, AppDirection> = {
  es: "ltr",
  he: "rtl",
};

export function resolveLanguage(language: string | null | undefined): AppLanguage {
  if (!language) return defaultLanguage;
  const normalized = language.toLowerCase().split("-")[0];
  return supportedLanguages.includes(normalized as AppLanguage) ? (normalized as AppLanguage) : defaultLanguage;
}

export function getLanguageLocale(language: string | null | undefined): AppLocale {
  return localeByLanguage[resolveLanguage(language)];
}

export function getLanguageDirection(language: string | null | undefined): AppDirection {
  return directionByLanguage[resolveLanguage(language)];
}

export function isRtlLanguage(language: string | null | undefined) {
  return getLanguageDirection(language) === "rtl";
}
