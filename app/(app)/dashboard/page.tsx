import Link from "next/link";

import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyPnlChart } from "@/components/charts/monthly-pnl-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { TradingJournalIllustration } from "@/components/dashboard/trading-journal-illustration";
import { EmptyState } from "@/components/ui/empty-state";
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

  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden p-0">
        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:items-center">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="rtl-kicker text-xs font-semibold uppercase tracking-[0.24em] text-accent">{t("dashboard.eyebrow")}</p>
              <h1 className="text-3xl font-semibold text-text md:text-4xl">{t("dashboard.title")}</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted md:text-base">{t("dashboard.description")}</p>
            </div>
            <Link href="/trades/new">
              <Button>{t("common.actions.newTrade")}</Button>
            </Link>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-stroke/70 bg-background/45 p-3 sm:min-h-[260px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(61,217,180,0.18),transparent_34%),radial-gradient(circle_at_12%_85%,rgba(103,179,255,0.12),transparent_30%)]" />
            <TradingJournalIllustration
              title={t("dashboard.title")}
              className="relative mx-auto max-w-[480px]"
            />
          </div>
        </div>
      </section>

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
            <StatCard label={t("dashboard.stats.winRate")} value={formatPercent(analytics.winRate, 2, locale)} trend={analytics.winRate >= 50 ? "positive" : "negative"} />
            <StatCard label={t("dashboard.stats.profitFactor")} value={formatRatio(analytics.profitFactor, 2, locale)} trend={analytics.profitFactor !== null && analytics.profitFactor >= 1.5 ? "positive" : "neutral"} />
            <StatCard label={t("dashboard.stats.expectancy")} value={formatCurrency(analytics.expectancy, "USD", locale)} trend={analytics.expectancy >= 0 ? "positive" : "negative"} />
            <StatCard label={t("dashboard.stats.averageR")} value={formatNumber(analytics.averageR, 2, locale)} />
            <StatCard label={t("dashboard.stats.maxDrawdown")} value={formatCurrency(analytics.maxDrawdown, "USD", locale)} trend="negative" />
            <StatCard label={t("dashboard.stats.closedTrades")} value={formatNumber(analytics.closedTrades.length, 0, locale)} />
            <StatCard label={t("dashboard.stats.openTrades")} value={formatNumber(analytics.openTrades.length, 0, locale)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <EquityCurveChart data={analytics.equityCurve} />
            <MonthlyPnlChart data={analytics.monthlyPnL} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PerformanceBarChart
              title={t("dashboard.charts.tickerTitle")}
              data={analytics.resultsByTicker}
            />
            <PerformanceBarChart
              title={t("dashboard.charts.setupTitle")}
              data={analytics.resultsBySetup}
            />
          </section>
        </>
      )}
    </div>
  );
}
