"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-stroke bg-panel p-6 shadow-panel">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel ?? t("common.actions.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? t("common.states.deleting") : (confirmLabel ?? t("common.actions.confirm"))}
          </Button>
        </div>
      </div>
    </div>
  );
}
