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

export default async function AnalyticsPage() {
  const trades = await getTradesForCurrentUser();
  const analytics = buildAnalytics(trades);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análisis"
        title="Analytics de swing trading"
        description="Lectura más profunda de riesgo, edge y consistencia usando solo datos cerrados y fórmulas robustas."
      />

      {analytics.closedTrades.length === 0 ? (
        <EmptyState
          title="Aún no hay trades cerrados"
          description="Cierra algunas operaciones para desbloquear distribución de R, curvas y comparativas."
          actionHref="/trades/new"
          actionLabel="Crear trade"
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total ganado" value={formatCompactCurrency(analytics.totalWon)} trend="positive" />
            <StatCard label="Total perdido" value={formatCompactCurrency(analytics.totalLost)} trend="negative" />
            <StatCard label="% trades ganadores" value={formatPercent(analytics.winRate)} />
            <StatCard label="Holding promedio" value={formatHoldingDays(analytics.averageHoldingDays)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <EquityCurveChart data={analytics.equityCurve} />
            <MonthlyPnlChart data={analytics.monthlyPnL} />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <RDistributionChart data={analytics.rDistribution} />
            <PerformanceBarChart
              title="Resultados por ticker"
              description="Comparativa de instrumentos más rentables."
              data={analytics.resultsByTicker}
            />
            <PerformanceBarChart
              title="Resultados por setup"
              description="Comparativa de setups para ver dónde está tu edge."
              data={analytics.resultsBySetup}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PerformanceBarChart
              title="Longs vs shorts"
              description="Comparación simple del rendimiento por dirección."
              data={analytics.longsVsShorts.map((item) => ({ name: item.side, pnl: item.pnl, trades: item.trades }))}
            />
            <WinRateTrendChart data={analytics.monthlyPnL.map((item) => ({ label: item.label, winRate: item.winRate }))} />
          </section>
        </>
      )}
    </div>
  );
}
