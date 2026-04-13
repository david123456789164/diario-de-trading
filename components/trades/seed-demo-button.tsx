"use client";

import { DatabaseZap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SeedDemoButton() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    const response = await fetch("/api/seed-demo", {
      method: "POST",
      headers: {
        "X-App-Language": i18n.language,
      },
    });
    const data = (await response.json().catch(() => null)) as { inserted?: number; error?: string } | null;
    setLoading(false);

    if (!response.ok) {
      toast.error(data?.error ?? t("settings.toasts.demoError"));
      return;
    }

    toast.success(t("settings.toasts.demoSuccess", { count: data?.inserted ?? 0 }));
    router.refresh();
  }

  return (
    <Button variant="secondary" onClick={handleSeed} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      {t("settings.demoButton")}
    </Button>
  );
}
