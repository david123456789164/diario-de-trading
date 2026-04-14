import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "@/src/i18n/resources";
import { defaultLanguage, fallbackLanguage, resolveLanguage } from "@/src/i18n/settings";

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  return resolveLanguage(document.documentElement.lang);
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
