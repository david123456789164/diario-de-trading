"use client";

import { Download, FileUp, Loader2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { tradeImportTemplateHeaders } from "@/lib/trading/import-csv";

type ImportError = {
  row: number;
  message: string;
};

function buildTemplateCsv() {
  const sample = [
    "AAPL",
    "stock",
    "long",
    "Pullback EMA 21",
    "closed",
    "2026-04-20",
    "2026-04-25",
    "180.5",
    "190.2",
    "176",
    "196",
    "10",
    "2.5",
    "10000",
    "100",
    "Daily trend held support",
    "Scaled out near resistance",
    "",
    "Followed plan",
    "swing | pullback",
  ];

  return [tradeImportTemplateHeaders.join(","), sample.join(",")].join("\n");
}

export function TradeImportCard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<ImportError[]>([]);

  const templateHref = useMemo(() => {
    const blob = new Blob([buildTemplateCsv()], { type: "text/csv;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, []);

  useEffect(() => () => URL.revokeObjectURL(templateHref), [templateHref]);

  async function importTrades() {
    if (!selectedFile) return;

    setImporting(true);
    setErrors([]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/trades/import", {
      method: "POST",
      headers: {
        "X-App-Language": i18n.language,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | { imported?: number; error?: string; errors?: ImportError[] }
      | null;

    setImporting(false);

    if (!response.ok) {
      if (data?.errors?.length) {
        setErrors(data.errors);
        toast.error(t("import.toasts.validationError"));
        return;
      }

      toast.error(data?.error ?? t("import.toasts.importError"));
      return;
    }

    toast.success(t("import.toasts.success", { count: data?.imported ?? 0 }));
    setSelectedFile(null);
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text">{t("import.title")}</h2>
          <p className="text-sm text-muted">{t("import.description")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={templateHref} download="trades-import-template.csv">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              {t("import.downloadTemplate")}
            </Button>
          </a>
          <Button onClick={importTrades} disabled={!selectedFile || importing}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {importing ? t("import.importing") : t("import.importButton")}
          </Button>
        </div>
      </div>

      <label className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stroke bg-background/40 p-5 text-center">
        <FileUp className="h-6 w-6 text-accent" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-text">
            {selectedFile ? selectedFile.name : t("import.chooseFile")}
          </p>
          <p className="text-xs text-muted">{t("import.requirements")}</p>
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
            setErrors([]);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-semibold text-danger">{t("import.errorsTitle")}</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-sm text-muted">
            {errors.slice(0, 12).map((error) => (
              <li key={`${error.row}-${error.message}`}>
                {t("import.rowLabel", { row: error.row })}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
