"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect, type ReactNode } from "react";

import i18n from "@/src/i18n";
import { applyClientLanguage } from "@/src/i18n/client";
import { resolveLanguage, type AppLanguage } from "@/src/i18n/settings";

export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: AppLanguage;
}) {
  useEffect(() => {
    const language = applyClientLanguage(initialLanguage);

    if (resolveLanguage(i18n.language) !== language) {
      void i18n.changeLanguage(language);
    }

    function handleLanguageChanged(nextLanguage: string) {
      applyClientLanguage(nextLanguage);
    }

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [initialLanguage]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
