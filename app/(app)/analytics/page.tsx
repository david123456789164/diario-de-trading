import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyPnlChart } from "@/components/charts/monthly-pnl-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { RDistributionChart } from "@/components/charts/r-distribution-chart";
import { WinRateTrendChart } from "@/components/charts/win-rate-trend-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { buildAnalytics } from "@/lib/trading/calculations";
import { getTradesForCurrentUser } from "@/lib/trading/queries";
import { formatCompactCurrency, formatHoldingDays, formatPercent } from "@/lib/utils/format";
import { getServerTranslation } from "@/src/i18n/server";

export default async function AnalyticsPage() {
  const { t, locale } = await getServerTranslation();
  const trades = await getTradesForCurrentUser();
  const analytics = buildAnalytics(trades, locale);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("analytics.eyebrow")}
        title={t("analytics.title")}
        description={t("analytics.description")}
      />

      {analytics.closedTrades.length === 0 ? (
        <EmptyState
          title={t("analytics.emptyTitle")}
          description={t("analytics.emptyDescription")}
          actionHref="/trades/new"
          actionLabel={t("analytics.emptyAction")}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t("analytics.stats.totalWon")} value={formatCompactCurrency(analytics.totalWon, "USD", locale)} trend="positive" />
            <StatCard label={t("analytics.stats.totalLost")} value={formatCompactCurrency(analytics.totalLost, "USD", locale)} trend="negative" />
            <StatCard label={t("analytics.stats.winningTradesPercent")} value={formatPercent(analytics.winRate, 2, locale)} />
            <StatCard label={t("analytics.stats.averageHolding")} value={formatHoldingDays(analytics.averageHoldingDays, locale)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <EquityCurveChart data={analytics.equityCurve} />
            <MonthlyPnlChart data={analytics.monthlyPnL} />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <RDistributionChart data={analytics.rDistribution} />
            <PerformanceBarChart
              title={t("analytics.charts.tickerTitle")}
              description={t("analytics.charts.tickerDescription")}
              data={analytics.resultsByTicker}
            />
            <PerformanceBarChart
              title={t("analytics.charts.setupTitle")}
              description={t("analytics.charts.setupDescription")}
              data={analytics.resultsBySetup}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PerformanceBarChart
              title={t("analytics.charts.longShortTitle")}
              description={t("analytics.charts.longShortDescription")}
              data={analytics.longsVsShorts.map((item) => ({ name: t(`trades.direction.${item.side.toLowerCase()}`), pnl: item.pnl, trades: item.trades }))}
            />
            <WinRateTrendChart data={analytics.monthlyPnL.map((item) => ({ label: item.label, winRate: item.winRate }))} />
          </section>
        </>
      )}
    </div>
  );
}
