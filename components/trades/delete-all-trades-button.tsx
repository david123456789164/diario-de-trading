"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteAllTradesButton() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteAllTrades() {
    setDeleting(true);

    const response = await fetch("/api/trades-bulk", {
      method: "DELETE",
      headers: {
        "X-App-Language": i18n.language,
      },
    });

    const data = (await response.json().catch(() => null)) as { deleted?: number; error?: string } | null;
    setDeleting(false);

    if (!response.ok) {
      toast.error(data?.error ?? t("trades.deleteAll.error"));
      return;
    }

    setConfirmOpen(false);
    toast.success(t("trades.deleteAll.success", { count: data?.deleted ?? 0 }));
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={deleting}>
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {t("trades.deleteAll.button")}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title={t("trades.deleteAll.title")}
        description={t("trades.deleteAll.description")}
        confirmLabel={t("trades.deleteAll.confirm")}
        cancelLabel={t("common.actions.cancel")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deleteAllTrades}
        loading={deleting}
      />
    </>
  );
}
