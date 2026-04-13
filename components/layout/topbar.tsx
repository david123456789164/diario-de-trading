"use client";

import { CalendarRange } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { getLanguageLocale } from "@/src/i18n/settings";

export function Topbar({ email }: { email: string | undefined }) {
  const { t, i18n } = useTranslation();
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(getLanguageLocale(i18n.language), {
        dateStyle: "full",
      }).format(new Date()),
    [i18n.language],
  );

  return (
    <div className="glass-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{email ?? t("common.states.authenticatedUser")}</p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange className="h-4 w-4" />
          {today}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <LanguageSwitcher />
        <SignOutButton />
      </div>
    </div>
  );
}
