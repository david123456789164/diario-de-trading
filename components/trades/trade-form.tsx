"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Save, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { assetTypeOptions, directionOptions, tradeStatusOptions } from "@/lib/trading/constants";
import {
  createTradePayloadSchema,
  normalizeTagList,
  type TradePayload,
  type TradeFormValues,
} from "@/lib/trading/schemas";

type TradeFormInitialValues = Partial<TradePayload> & {
  existingImageUrl?: string | null;
  existingImageFileName?: string | null;
};

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </label>
  );
}

export function TradeForm({
  mode,
  tradeId,
  initialValues,
}: {
  mode: "create" | "edit";
  tradeId?: string;
  initialValues?: TradeFormInitialValues;
}) {
  const { t, i18n } = useTranslation();
  const tradePayloadSchema = useMemo(() => createTradePayloadSchema(t), [t]);
  const defaultValues = useMemo<TradeFormValues>(
    () => ({
      ticker: initialValues?.ticker ?? "",
      assetType: initialValues?.assetType ?? "stock",
      direction: initialValues?.direction ?? "long",
      setup: initialValues?.setup ?? "",
      entryDate: initialValues?.entryDate ?? new Date().toISOString().slice(0, 10),
      exitDate: initialValues?.exitDate ?? "",
      entryPrice: initialValues?.entryPrice ?? "",
      exitPrice: initialValues?.exitPrice ?? "",
      initialStopLoss: initialValues?.initialStopLoss ?? "",
      initialTakeProfit: initialValues?.initialTakeProfit ?? "",
      quantity: initialValues?.quantity ?? "",
      fees: initialValues?.fees ?? 0,
      accountSize: initialValues?.accountSize ?? "",
      plannedRiskAmount: initialValues?.plannedRiskAmount ?? "",
      thesis: initialValues?.thesis ?? "",
      notes: initialValues?.notes ?? "",
      mistakes: initialValues?.mistakes ?? "",
      lessonLearned: initialValues?.lessonLearned ?? "",
      status: initialValues?.status ?? "open",
      tags: initialValues?.tags ?? [],
    }),
    [initialValues],
  );

  const [tagsText, setTagsText] = useState((initialValues?.tags ?? []).join(", "));
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(initialValues?.existingImageUrl ?? null);

  const form = useForm<TradeFormValues, unknown, TradePayload>({
    resolver: zodResolver(tradePayloadSchema),
    defaultValues,
  });

  const watchedStatus = form.watch("status");
  const watchedDirection = form.watch("direction");

  function handleFileChange(file: File | null) {
    if (!file) {
      setSelectedImage(null);
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("trades.form.toasts.invalidImageType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("trades.form.toasts.imageTooLarge"));
      return;
    }

    setSelectedImage(file);
    setRemoveCurrentImage(false);
  }

  async function uploadImage(id: string) {
    if (!selectedImage) return true;

    const formData = new FormData();
    formData.append("file", selectedImage);

    const response = await fetch(`/api/trades/${id}/screenshot`, {
      method: "POST",
      headers: {
        "X-App-Language": i18n.language,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? t("trades.form.toasts.imageUploadError"));
      return false;
    }

    return true;
  }

  async function deleteExistingImage(id: string) {
    const response = await fetch(`/api/trades/${id}/screenshot`, {
      method: "DELETE",
      headers: {
        "X-App-Language": i18n.language,
      },
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? t("trades.form.toasts.imageDeleteError"));
      return false;
    }

    setExistingImageUrl(null);
    return true;
  }

  async function onSubmit(values: TradePayload) {
    setSubmitting(true);
    const payload = {
      ...values,
      ticker: values.ticker.toUpperCase().trim(),
      setup: values.setup.trim(),
      tags: normalizeTagList(tagsText),
    };

    const response = await fetch(mode === "create" ? "/api/trades" : `/api/trades/${tradeId}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-App-Language": i18n.language,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          trade?: { id: string };
          error?: string;
          fieldErrors?: Record<string, string[]>;
        }
      | null;

    if (!response.ok || !data?.trade) {
      setSubmitting(false);
      toast.error(data?.error ?? t("trades.form.toasts.saveError"));
      return;
    }

    const id = data.trade.id;

    if (removeCurrentImage && existingImageUrl) {
      await deleteExistingImage(id);
    }

    if (selectedImage) {
      await uploadImage(id);
    }

    toast.success(mode === "create" ? t("trades.form.toasts.created") : t("trades.form.toasts.updated"));
    window.location.href = `/trades/${id}`;
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label={t("trades.form.labels.ticker")} error={form.formState.errors.ticker?.message}>
          <Input placeholder={t("trades.form.placeholders.ticker")} {...form.register("ticker")} />
        </Field>

        <Field label={t("trades.form.labels.assetType")} error={form.formState.errors.assetType?.message}>
          <Select {...form.register("assetType")}>
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("trades.form.labels.direction")} error={form.formState.errors.direction?.message}>
          <Select {...form.register("direction")}>
            {directionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("trades.form.labels.status")} error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            {tradeStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("trades.form.labels.setup")} error={form.formState.errors.setup?.message}>
          <Input placeholder={t("trades.form.placeholders.setup")} {...form.register("setup")} />
        </Field>

        <Field label={t("trades.form.labels.entryDate")} error={form.formState.errors.entryDate?.message}>
          <Input type="date" {...form.register("entryDate")} />
        </Field>

        <Field label={t("trades.form.labels.exitDate")} error={form.formState.errors.exitDate?.message} hint={watchedStatus === "open" ? t("trades.form.hints.exitDateOpen") : undefined}>
          <Input type="date" {...form.register("exitDate")} />
        </Field>

        <Field label={t("trades.form.labels.quantity")} error={form.formState.errors.quantity?.message}>
          <Input type="number" min="0" step="1" {...form.register("quantity")} />
        </Field>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label={t("trades.form.labels.entryPrice")} error={form.formState.errors.entryPrice?.message}>
          <Input type="number" min="0" step="0.0001" {...form.register("entryPrice")} />
        </Field>

        <Field label={t("trades.form.labels.exitPrice")} error={form.formState.errors.exitPrice?.message}>
          <Input type="number" min="0" step="0.0001" {...form.register("exitPrice")} />
        </Field>

        <Field
          label={t("trades.form.labels.initialStopLoss")}
          error={form.formState.errors.initialStopLoss?.message}
          hint={watchedDirection === "long" ? t("trades.form.hints.longStop") : t("trades.form.hints.shortStop")}
        >
          <Input type="number" min="0" step="0.0001" {...form.register("initialStopLoss")} />
        </Field>

        <Field
          label={t("trades.form.labels.initialTakeProfit")}
          error={form.formState.errors.initialTakeProfit?.message}
          hint={watchedDirection === "long" ? t("trades.form.hints.longTakeProfit") : t("trades.form.hints.shortTakeProfit")}
        >
          <Input type="number" min="0" step="0.0001" {...form.register("initialTakeProfit")} />
        </Field>

        <Field label={t("trades.form.labels.fees")} error={form.formState.errors.fees?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("fees")} />
        </Field>

        <Field label={t("trades.form.labels.accountSize")} error={form.formState.errors.accountSize?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("accountSize")} />
        </Field>

        <Field label={t("trades.form.labels.plannedRiskAmount")} error={form.formState.errors.plannedRiskAmount?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("plannedRiskAmount")} />
        </Field>

        <Field label={t("trades.form.labels.tags")} hint={t("trades.form.hints.tags")}>
          <Input
            value={tagsText}
            onChange={(event) => {
              const value = event.target.value;
              setTagsText(value);
              form.setValue("tags", normalizeTagList(value), { shouldValidate: true });
            }}
            placeholder={t("trades.form.placeholders.tags")}
          />
        </Field>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <Field label={t("trades.form.labels.thesis")} error={form.formState.errors.thesis?.message}>
            <Textarea placeholder={t("trades.form.placeholders.thesis")} {...form.register("thesis")} />
          </Field>

          <Field label={t("trades.form.labels.notes")} error={form.formState.errors.notes?.message}>
            <Textarea placeholder={t("trades.form.placeholders.notes")} {...form.register("notes")} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <Field label={t("trades.form.labels.mistakes")} error={form.formState.errors.mistakes?.message}>
            <Textarea placeholder={t("trades.form.placeholders.mistakes")} {...form.register("mistakes")} />
          </Field>

          <Field label={t("trades.form.labels.lessonLearned")} error={form.formState.errors.lessonLearned?.message}>
            <Textarea placeholder={t("trades.form.placeholders.lessonLearned")} {...form.register("lessonLearned")} />
          </Field>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text">{t("trades.form.screenshot.title")}</h3>
          <p className="text-sm text-muted">{t("trades.form.screenshot.description")}</p>
        </div>

        {existingImageUrl && !removeCurrentImage ? (
          <div className="overflow-hidden rounded-lg border border-stroke">
            <img src={existingImageUrl} alt={t("trades.form.screenshot.alt")} className="max-h-[360px] w-full object-cover" />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stroke bg-background/40 p-6 text-center">
            <UploadCloud className="h-7 w-7 text-accent" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text">
                {selectedImage ? selectedImage.name : t("trades.form.screenshot.choose")}
              </p>
              <p className="text-xs text-muted">{t("trades.form.screenshot.requirements")}</p>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            {existingImageUrl ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setRemoveCurrentImage((current) => !current);
                  if (!removeCurrentImage) setSelectedImage(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {removeCurrentImage ? t("trades.form.screenshot.keep") : t("trades.form.screenshot.removeCurrent")}
              </Button>
            ) : null}

            {selectedImage ? (
              <Button variant="secondary" onClick={() => setSelectedImage(null)}>
                <ImagePlus className="h-4 w-4" />
                {t("trades.form.screenshot.removeFile")}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => window.history.back()} disabled={submitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? t("common.states.saving") : mode === "create" ? t("common.actions.createTrade") : t("common.actions.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
