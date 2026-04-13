import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "@/src/i18n/resources";
import { defaultLanguage, fallbackLanguage, languageCookieName, languageStorageKey, resolveLanguage } from "@/src/i18n/settings";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  return resolveLanguage(
    window.localStorage.getItem(languageStorageKey) ??
      readCookie(languageCookieName) ??
      document.documentElement.lang,
  );
}

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: fallbackLanguage,
    supportedLngs: ["es", "he"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });
}

export default i18next;
