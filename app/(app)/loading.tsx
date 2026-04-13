"use client";

import { useTranslation } from "react-i18next";

export default function AppLoading() {
  const { t } = useTranslation();

  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <div className="rounded-lg border border-stroke bg-panel px-6 py-4 text-sm text-muted">{t("common.states.loadingData")}</div>
    </div>
  );
}
