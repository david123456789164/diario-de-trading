import Link from "next/link";

import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyPnlChart } from "@/components/charts/monthly-pnl-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { buildAnalytics } from "@/lib/trading/calculations";
import { getTradesForCurrentUser } from "@/lib/trading/queries";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent, formatRatio } from "@/lib/utils/format";
import { getServerTranslation } from "@/src/i18n/server";

export default async function DashboardPage() {
  const { t, locale } = await getServerTranslation();
  const trades = await getTradesForCurrentUser();
  const analytics = buildAnalytics(trades, locale);
  const totalDirectionalTrades = analytics.longsVsShorts.reduce((sum, item) => sum + item.trades, 0);
  const longRatio =
    totalDirectionalTrades > 0
      ? (analytics.longsVsShorts.find((item) => item.side === "Long")?.trades ?? 0) / totalDirectionalTrades
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <Link href="/trades/new">
            <Button>{t("common.actions.newTrade")}</Button>
          </Link>
        }
      />

      {trades.length === 0 ? (
        <EmptyState
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDescription")}
          actionHref="/trades/new"
          actionLabel={t("dashboard.emptyAction")}
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("dashboard.stats.totalNetPnl")} value={formatCompactCurrency(analytics.totalNetPnL, "USD", locale)} trend={analytics.totalNetPnL >= 0 ? "positive" : "negative"} />
            <StatCard label={t("dashboard.stats.winRate")} value={formatPercent(analytics.winRate, 2, locale)} hint={t("dashboard.stats.winRateHint", { wins: analytics.wins, losses: analytics.losses })} trend={analytics.winRate >= 50 ? "positive" : "negative"} />
            <StatCard label={t("dashboard.stats.profitFactor")} value={formatRatio(analytics.profitFactor, 2, locale)} hint={t("dashboard.stats.profitFactorHint")} trend={analytics.profitFactor !== null && analytics.profitFactor >= 1.5 ? "positive" : "neutral"} />
            <StatCard label={t("dashboard.stats.expectancy")} value={formatCurrency(analytics.expectancy, "USD", locale)} hint={t("dashboard.stats.expectancyHint")} trend={analytics.expectancy >= 0 ? "positive" : "negative"} />
            <StatCard label={t("dashboard.stats.averageWinner")} value={formatCurrency(analytics.averageWinner, "USD", locale)} />
            <StatCard label={t("dashboard.stats.averageLoser")} value={formatCurrency(analytics.averageLoser, "USD", locale)} trend={analytics.averageLoser < 0 ? "negative" : "neutral"} />
            <StatCard label={t("dashboard.stats.averageR")} value={formatNumber(analytics.averageR, 2, locale)} />
            <StatCard label={t("dashboard.stats.maxDrawdown")} value={formatCurrency(analytics.maxDrawdown, "USD", locale)} trend="negative" />
            <StatCard label={t("dashboard.stats.closedTrades")} value={formatNumber(analytics.closedTrades.length, 0, locale)} />
            <StatCard label={t("dashboard.stats.openTrades")} value={formatNumber(analytics.openTrades.length, 0, locale)} />
            <StatCard label={t("dashboard.stats.averageHolding")} value={formatNumber(analytics.averageHoldingDays, 1, locale)} hint={t("dashboard.stats.averageHoldingHint")} />
            <StatCard label={t("dashboard.stats.longShortRatio")} value={`${formatPercent(longRatio * 100, 0, locale)} / ${formatPercent((1 - longRatio) * 100, 0, locale)}`} hint={t("dashboard.stats.longShortRatioHint")} />
            <StatCard label={t("dashboard.stats.bestTrade")} value={formatCurrency(analytics.bestTrade?.netPnL ?? null, "USD", locale)} trend="positive" />
            <StatCard label={t("dashboard.stats.worstTrade")} value={formatCurrency(analytics.worstTrade?.netPnL ?? null, "USD", locale)} trend="negative" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <EquityCurveChart data={analytics.equityCurve} />
            <MonthlyPnlChart data={analytics.monthlyPnL} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PerformanceBarChart
              title={t("dashboard.charts.tickerTitle")}
              description={t("dashboard.charts.tickerDescription")}
              data={analytics.resultsByTicker}
            />
            <PerformanceBarChart
              title={t("dashboard.charts.setupTitle")}
              description={t("dashboard.charts.setupDescription")}
              data={analytics.resultsBySetup}
            />
          </section>
        </>
      )}
    </div>
  );
}
