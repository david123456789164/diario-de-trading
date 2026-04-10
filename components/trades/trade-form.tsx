"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Save, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { assetTypeOptions, directionOptions, tradeStatusOptions } from "@/lib/trading/constants";
import {
  normalizeTagList,
  tradePayloadSchema,
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
      toast.error("Solo se permiten imágenes PNG, JPG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 5 MB.");
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
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? "El trade se guardó, pero la imagen no se pudo subir.");
      return false;
    }

    return true;
  }

  async function deleteExistingImage(id: string) {
    const response = await fetch(`/api/trades/${id}/screenshot`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? "No se pudo eliminar la imagen actual.");
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
      toast.error(data?.error ?? "No se pudo guardar el trade.");
      return;
    }

    const id = data.trade.id;

    if (removeCurrentImage && existingImageUrl) {
      await deleteExistingImage(id);
    }

    if (selectedImage) {
      await uploadImage(id);
    }

    toast.success(mode === "create" ? "Trade creado correctamente." : "Trade actualizado correctamente.");
    window.location.href = `/trades/${id}`;
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Ticker" error={form.formState.errors.ticker?.message}>
          <Input placeholder="AAPL" {...form.register("ticker")} />
        </Field>

        <Field label="Tipo de activo" error={form.formState.errors.assetType?.message}>
          <Select {...form.register("assetType")}>
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Dirección" error={form.formState.errors.direction?.message}>
          <Select {...form.register("direction")}>
            {directionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Estado" error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            {tradeStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Setup / estrategia" error={form.formState.errors.setup?.message}>
          <Input placeholder="Pullback EMA 21" {...form.register("setup")} />
        </Field>

        <Field label="Fecha de entrada" error={form.formState.errors.entryDate?.message}>
          <Input type="date" {...form.register("entryDate")} />
        </Field>

        <Field label="Fecha de salida" error={form.formState.errors.exitDate?.message} hint={watchedStatus === "open" ? "Déjala vacía si la operación sigue abierta." : undefined}>
          <Input type="date" {...form.register("exitDate")} />
        </Field>

        <Field label="Cantidad de shares" error={form.formState.errors.quantity?.message}>
          <Input type="number" min="0" step="1" {...form.register("quantity")} />
        </Field>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Precio de entrada" error={form.formState.errors.entryPrice?.message}>
          <Input type="number" min="0" step="0.0001" {...form.register("entryPrice")} />
        </Field>

        <Field label="Precio de salida" error={form.formState.errors.exitPrice?.message}>
          <Input type="number" min="0" step="0.0001" {...form.register("exitPrice")} />
        </Field>

        <Field
          label="Stop loss inicial"
          error={form.formState.errors.initialStopLoss?.message}
          hint={watchedDirection === "long" ? "Para long debe quedar por debajo de la entrada." : "Para short debe quedar por encima de la entrada."}
        >
          <Input type="number" min="0" step="0.0001" {...form.register("initialStopLoss")} />
        </Field>

        <Field
          label="Take profit inicial"
          error={form.formState.errors.initialTakeProfit?.message}
          hint={watchedDirection === "long" ? "Para long debe quedar por encima de la entrada." : "Para short debe quedar por debajo de la entrada."}
        >
          <Input type="number" min="0" step="0.0001" {...form.register("initialTakeProfit")} />
        </Field>

        <Field label="Fees / comisiones" error={form.formState.errors.fees?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("fees")} />
        </Field>

        <Field label="Tamaño de cuenta" error={form.formState.errors.accountSize?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("accountSize")} />
        </Field>

        <Field label="Riesgo planeado en USD" error={form.formState.errors.plannedRiskAmount?.message}>
          <Input type="number" min="0" step="0.01" {...form.register("plannedRiskAmount")} />
        </Field>

        <Field label="Etiquetas" hint="Sepáralas con coma. Ejemplo: earnings, gap, trend">
          <Input
            value={tagsText}
            onChange={(event) => {
              const value = event.target.value;
              setTagsText(value);
              form.setValue("tags", normalizeTagList(value), { shouldValidate: true });
            }}
            placeholder="swing, ruptura, volumen"
          />
        </Field>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Tesis de entrada" error={form.formState.errors.thesis?.message}>
            <Textarea placeholder="¿Qué viste y por qué tomaste la operación?" {...form.register("thesis")} />
          </Field>

          <Field label="Notas" error={form.formState.errors.notes?.message}>
            <Textarea placeholder="Contexto adicional, manejo, salidas parciales, etc." {...form.register("notes")} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <Field label="Errores cometidos" error={form.formState.errors.mistakes?.message}>
            <Textarea placeholder="¿Qué salió mal o se ejecutó mal?" {...form.register("mistakes")} />
          </Field>

          <Field label="Aprendizaje / lesson learned" error={form.formState.errors.lessonLearned?.message}>
            <Textarea placeholder="¿Qué cambiarías o repetirías en el próximo trade?" {...form.register("lessonLearned")} />
          </Field>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text">Screenshot del trade</h3>
          <p className="text-sm text-muted">Opcional. Se guarda en Supabase Storage dentro de tu espacio privado.</p>
        </div>

        {existingImageUrl && !removeCurrentImage ? (
          <div className="overflow-hidden rounded-3xl border border-stroke">
            <img src={existingImageUrl} alt="Screenshot del trade" className="max-h-[360px] w-full object-cover" />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-stroke bg-background/40 p-6 text-center">
            <UploadCloud className="h-7 w-7 text-accent" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text">
                {selectedImage ? selectedImage.name : "Haz clic para elegir una imagen"}
              </p>
              <p className="text-xs text-muted">PNG, JPG o WEBP. Máximo 5 MB.</p>
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
                {removeCurrentImage ? "Conservar imagen" : "Quitar imagen actual"}
              </Button>
            ) : null}

            {selectedImage ? (
              <Button variant="secondary" onClick={() => setSelectedImage(null)}>
                <ImagePlus className="h-4 w-4" />
                Quitar archivo
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => window.history.back()} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? "Guardando..." : mode === "create" ? "Crear trade" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
