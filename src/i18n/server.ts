import { cookies } from "next/headers";
import { createInstance } from "i18next";

import { resources } from "@/src/i18n/resources";
import {
  fallbackLanguage,
  getLanguageDirection,
  getLanguageLocale,
  languageCookieName,
  resolveLanguage,
  type AppLanguage,
} from "@/src/i18n/settings";

const serverI18n = createInstance();

if (!serverI18n.isInitialized) {
  serverI18n.init({
    resources,
    lng: fallbackLanguage,
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

export async function getServerLanguage(): Promise<AppLanguage> {
  const cookieStore = await cookies();
  return resolveLanguage(cookieStore.get(languageCookieName)?.value);
}

export async function getServerTranslation() {
  const language = await getServerLanguage();

  return {
    language,
    locale: getLanguageLocale(language),
    dir: getLanguageDirection(language),
    t: serverI18n.getFixedT(language, "common"),
  };
}

export function getRequestLanguage(request: Request): AppLanguage {
  const url = new URL(request.url);
  return resolveLanguage(request.headers.get("x-app-language") ?? url.searchParams.get("lng"));
}

export function getTranslationForLanguage(language: string | null | undefined) {
  const resolvedLanguage = resolveLanguage(language);

  return {
    language: resolvedLanguage,
    locale: getLanguageLocale(resolvedLanguage),
    dir: getLanguageDirection(resolvedLanguage),
    t: serverI18n.getFixedT(resolvedLanguage, "common"),
  };
}
