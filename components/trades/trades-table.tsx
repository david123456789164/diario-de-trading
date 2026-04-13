"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import type { ComputedTrade } from "@/lib/trading/calculations";
import { formatCurrency, formatDate, formatHoldingDays, formatPercent, formatRatio } from "@/lib/utils/format";
import { getLanguageLocale } from "@/src/i18n/settings";

function statusTone(status: string) {
  switch (status) {
    case "closed":
      return "positive";
    case "open":
      return "info";
    case "cancelled":
      return "warning";
    case "invalidated":
      return "negative";
    default:
      return "neutral";
  }
}

function outcomeTone(outcome: ComputedTrade["outcome"]) {
  switch (outcome) {
    case "winner":
      return "positive";
    case "loser":
      return "negative";
    case "breakeven":
      return "warning";
    default:
      return "neutral";
  }
}

export function TradesTable({
  items,
  page,
  totalPages,
}: {
  items: ComputedTrade[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tradeToDelete, setTradeToDelete] = useState<ComputedTrade | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const locale = getLanguageLocale(i18n.language);

  const pagination = useMemo(() => {
    const createPageUrl = (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      return `${pathname}?${params.toString()}`;
    };

    return {
      prev: createPageUrl(Math.max(1, page - 1)),
      next: createPageUrl(Math.min(totalPages, page + 1)),
    };
  }, [page, pathname, searchParams, totalPages]);

  async function confirmDelete() {
    if (!tradeToDelete) return;
    setLoading(true);

    const response = await fetch(`/api/trades/${tradeToDelete.id}`, {
      method: "DELETE",
      headers: {
        "X-App-Language": i18n.language,
      },
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(data?.error ?? t("trades.table.deleteError"));
      return;
    }

    toast.success(t("trades.table.deleteSuccess"));
    setTradeToDelete(null);
    router.refresh();
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke text-sm">
            <thead className="bg-background/40">
              <tr className="text-start text-muted">
                <th className="px-4 py-4 font-medium">{t("common.metrics.ticker")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.status")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.setup")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.entry")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.exit")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.netPnl")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.pnlPercent")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.r")}</th>
                <th className="px-4 py-4 font-medium">{t("common.metrics.holding")}</th>
                <th className="px-4 py-4 font-medium text-end">{t("common.metrics.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke/70">
              {items.map((trade) => (
                <tr key={trade.id} className="hover:bg-background/30">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-text">{trade.raw.ticker}</div>
                      <div className="flex items-center gap-2">
                        <Badge tone={trade.raw.direction === "long" ? "positive" : "warning"}>
                          {t(`trades.direction.${trade.raw.direction}`)}
                        </Badge>
                        <Badge tone={outcomeTone(trade.outcome)}>
                          {t(`trades.outcome.${trade.outcome}`)}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={statusTone(trade.raw.status)}>
                      {t(`trades.status.${trade.raw.status}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-muted">{trade.raw.setup}</td>
                  <td className="px-4 py-4 text-muted">{formatDate(trade.raw.entry_date, "—", locale)}</td>
                  <td className="px-4 py-4 text-muted">{formatDate(trade.raw.exit_date, "—", locale)}</td>
                  <td className={`px-4 py-4 font-medium ${trade.netPnL == null ? "text-muted" : trade.netPnL < 0 ? "text-danger" : "text-accent"}`}>
                    {formatCurrency(trade.netPnL, "USD", locale)}
                  </td>
                  <td className="px-4 py-4 text-muted">{formatPercent(trade.pnlPercent, 2, locale)}</td>
                  <td className="px-4 py-4 text-muted">{formatRatio(trade.realizedR, 2, locale)}</td>
                  <td className="px-4 py-4 text-muted">{formatHoldingDays(trade.holdingDays, locale)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/trades/${trade.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/trades/${trade.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setTradeToDelete(trade)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-stroke/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">
            {t("trades.table.pageOf", { page, totalPages })}
          </p>
          <div className="flex gap-3">
            <Link href={pagination.prev}>
              <Button variant="secondary" size="sm" disabled={page <= 1}>
                {t("common.actions.previous")}
              </Button>
            </Link>
            <Link href={pagination.next}>
              <Button variant="secondary" size="sm" disabled={page >= totalPages}>
                {t("common.actions.next")}
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={!!tradeToDelete}
        title={t("trades.table.deleteTitle")}
        description={t("trades.table.deleteDescription", { ticker: tradeToDelete?.raw.ticker ?? t("trades.table.deleteFallback") })}
        confirmLabel={t("trades.table.deleteConfirm")}
        cancelLabel={t("common.actions.cancel")}
        onCancel={() => setTradeToDelete(null)}
        onConfirm={confirmDelete}
        loading={loading}
      />
    </>
  );
}
