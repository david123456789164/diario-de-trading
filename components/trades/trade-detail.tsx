"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ComputedTrade } from "@/lib/trading/calculations";
import {
  formatCurrency,
  formatDate,
  formatHoldingDays,
  formatNumber,
  formatPercent,
  formatRatio,
} from "@/lib/utils/format";
import { getLanguageLocale } from "@/src/i18n/settings";
import { useTranslation } from "react-i18next";

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="subtle-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-text">{value}</p>
    </div>
  );
}

function Block({ title, content }: { title: string; content?: string | null }) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted">{content || t("common.states.noContent")}</p>
    </Card>
  );
}

export function TradeDetail({
  trade,
  screenshotUrl,
}: {
  trade: ComputedTrade;
  screenshotUrl?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const locale = getLanguageLocale(i18n.language);

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold text-text">{trade.raw.ticker}</h2>
              <Badge tone={trade.raw.direction === "long" ? "positive" : "warning"}>
                {t(`trades.direction.${trade.raw.direction}`)}
              </Badge>
              <Badge tone={trade.raw.status === "closed" ? "positive" : trade.raw.status === "open" ? "info" : "warning"}>
                {t(`trades.status.${trade.raw.status}`)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(trade.raw.tags ?? []).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted">
              {t("trades.detail.setup")}: <span className="text-text">{trade.raw.setup}</span>
            </p>
          </div>

          <div className="text-end">
            <p className={`text-3xl font-semibold ${trade.netPnL == null ? "text-muted" : trade.netPnL < 0 ? "text-danger" : "text-accent"}`}>
              {formatCurrency(trade.netPnL, "USD", locale)}
            </p>
            <p className="mt-1 text-sm text-muted">{t("trades.detail.realizedNetPnl")}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label={t("trades.detail.grossPnl")} value={formatCurrency(trade.grossPnL, "USD", locale)} />
          <DetailMetric label={t("trades.detail.pnlPercent")} value={formatPercent(trade.pnlPercent, 2, locale)} />
          <DetailMetric label={t("trades.detail.realizedR")} value={formatRatio(trade.realizedR, 2, locale)} />
          <DetailMetric label={t("trades.detail.holdingDays")} value={formatHoldingDays(trade.holdingDays, locale)} />
          <DetailMetric label={t("trades.detail.totalRisk")} value={formatCurrency(trade.riskTotal, "USD", locale)} />
          <DetailMetric label={t("trades.detail.potentialReward")} value={formatCurrency(trade.rewardPotential, "USD", locale)} />
          <DetailMetric label={t("trades.detail.plannedRr")} value={formatRatio(trade.plannedRiskReward, 2, locale)} />
          <DetailMetric label={t("trades.detail.fees")} value={formatCurrency(trade.raw.fees, "USD", locale)} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailMetric label={t("trades.detail.entryDate")} value={formatDate(trade.raw.entry_date, "—", locale)} />
            <DetailMetric label={t("trades.detail.exitDate")} value={formatDate(trade.raw.exit_date, "—", locale)} />
            <DetailMetric label={t("trades.detail.quantity")} value={formatNumber(trade.raw.quantity, 0, locale)} />
            <DetailMetric label={t("trades.detail.entryPrice")} value={formatCurrency(trade.raw.entry_price, "USD", locale)} />
            <DetailMetric label={t("trades.detail.exitPrice")} value={formatCurrency(trade.raw.exit_price, "USD", locale)} />
            <DetailMetric label={t("trades.detail.accountSize")} value={formatCurrency(trade.raw.account_size, "USD", locale)} />
            <DetailMetric label={t("trades.detail.asset")} value={t(`trades.assetType.${trade.raw.asset_type}`)} />
            <DetailMetric label={t("trades.detail.initialStopLoss")} value={formatCurrency(trade.raw.initial_stop_loss, "USD", locale)} />
            <DetailMetric label={t("trades.detail.initialTakeProfit")} value={formatCurrency(trade.raw.initial_take_profit, "USD", locale)} />
            <DetailMetric label={t("trades.detail.plannedRisk")} value={formatCurrency(trade.raw.planned_risk_amount, "USD", locale)} />
          </Card>

          <Block title={t("trades.detail.thesis")} content={trade.raw.thesis} />
          <Block title={t("trades.detail.notes")} content={trade.raw.notes} />
          <Block title={t("trades.detail.mistakes")} content={trade.raw.mistakes} />
          <Block title={t("trades.detail.lessonLearned")} content={trade.raw.lesson_learned} />
        </div>

        <Card className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text">{t("trades.detail.screenshotTitle")}</h3>
          </div>

          {screenshotUrl ? (
            <div className="overflow-hidden rounded-lg border border-stroke">
              <img src={screenshotUrl} alt={t("trades.detail.screenshotAlt", { ticker: trade.raw.ticker })} className="w-full object-cover" />
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-stroke bg-background/40 text-sm text-muted">
              {t("trades.detail.noScreenshot")}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
