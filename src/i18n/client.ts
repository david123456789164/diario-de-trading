import {
  getLanguageDirection,
  languageCookieName,
  languageStorageKey,
  resolveLanguage,
  type AppLanguage,
} from "@/src/i18n/settings";

export function syncDocumentLanguage(language: AppLanguage) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = language;
  document.documentElement.dir = getLanguageDirection(language);
}

export function persistClientLanguage(language: AppLanguage) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(languageStorageKey, language);
  document.cookie = `${languageCookieName}=${language}; path=/; max-age=31536000; samesite=lax`;
}

export function applyClientLanguage(language: string | null | undefined) {
  const resolvedLanguage = resolveLanguage(language);

  syncDocumentLanguage(resolvedLanguage);
  persistClientLanguage(resolvedLanguage);

  return resolvedLanguage;
}
