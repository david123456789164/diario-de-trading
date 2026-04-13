"use client";

import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";

import { isRtlLanguage } from "@/src/i18n/settings";

export function I18nToaster() {
  const { i18n } = useTranslation();

  return <Toaster richColors position={isRtlLanguage(i18n.language) ? "top-left" : "top-right"} theme="dark" />;
}
