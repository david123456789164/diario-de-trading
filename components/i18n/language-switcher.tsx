"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { applyClientLanguage } from "@/src/i18n/client";
import {
  languageNames,
  resolveLanguage,
  supportedLanguages,
  type AppLanguage,
} from "@/src/i18n/settings";

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const activeLanguage = resolveLanguage(i18n.language);

  function handleChange(language: AppLanguage) {
    applyClientLanguage(language);
    void i18n.changeLanguage(language);
    startTransition(() => router.refresh());
  }

  return (
    <label className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
      <Select
        aria-label={t("language.label")}
        value={activeLanguage}
        onChange={(event) => handleChange(resolveLanguage(event.target.value))}
        disabled={isPending}
        className="h-9 min-w-[132px] rounded-lg py-0"
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {languageNames[language]}
          </option>
        ))}
      </Select>
    </label>
  );
}
