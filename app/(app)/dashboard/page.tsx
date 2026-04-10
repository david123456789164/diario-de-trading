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

export default async function DashboardPage() {
  const trades = await getTradesForCurrentUser();
  const analytics = buildAnalytics(trades);
  const totalDirectionalTrades = analytics.longsVsShorts.reduce((sum, item) => sum + item.trades, 0);
  const longRatio =
    totalDirectionalTrades > 0
      ? (analytics.longsVsShorts.find((item) => item.side === "Long")?.trades ?? 0) / totalDirectionalTrades
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visión general"
        title="Dashboard de rendimiento"
        description="Todo tu diario de swing trading resumido en métricas prácticas para mejorar proceso, riesgo y ejecución."
        actions={
          <Link href="/trades/new">
            <Button>Nuevo trade</Button>
          </Link>
        }
      />

      {trades.length === 0 ? (
        <EmptyState
          title="Todavía no registraste trades"
          description="Empieza con tu primera operación para activar el dashboard, las estadísticas y el análisis histórico."
          actionHref="/trades/new"
          actionLabel="Crear primer trade"
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="P&L neto acumulado" value={formatCompactCurrency(analytics.totalNetPnL)} trend={analytics.totalNetPnL >= 0 ? "positive" : "negative"} />
            <StatCard label="Win rate" value={formatPercent(analytics.winRate)} hint={`${analytics.wins} ganadores / ${analytics.losses} perdedores`} trend={analytics.winRate >= 50 ? "positive" : "negative"} />
            <StatCard label="Profit factor" value={formatRatio(analytics.profitFactor)} hint="Usa P&L neto de trades cerrados" trend={analytics.profitFactor !== null && analytics.profitFactor >= 1.5 ? "positive" : "neutral"} />
            <StatCard label="Expectancy" value={formatCurrency(analytics.expectancy)} hint="Expectativa promedio por trade cerrado" trend={analytics.expectancy >= 0 ? "positive" : "negative"} />
            <StatCard label="Average winner" value={formatCurrency(analytics.averageWinner)} />
            <StatCard label="Average loser" value={formatCurrency(analytics.averageLoser)} trend={analytics.averageLoser < 0 ? "negative" : "neutral"} />
            <StatCard label="R promedio" value={formatNumber(analytics.averageR)} />
            <StatCard label="Max drawdown" value={formatCurrency(analytics.maxDrawdown)} trend="negative" />
            <StatCard label="Trades cerrados" value={formatNumber(analytics.closedTrades.length, 0)} />
            <StatCard label="Trades abiertos" value={formatNumber(analytics.openTrades.length, 0)} />
            <StatCard label="Holding promedio" value={formatNumber(analytics.averageHoldingDays, 1)} hint="Días promedio en trades cerrados" />
            <StatCard label="Ratio long vs short" value={`${formatPercent(longRatio * 100, 0)} / ${formatPercent((1 - longRatio) * 100, 0)}`} hint="Participación long / short" />
            <StatCard label="Mejor trade" value={formatCurrency(analytics.bestTrade?.netPnL ?? null)} trend="positive" />
            <StatCard label="Peor trade" value={formatCurrency(analytics.worstTrade?.netPnL ?? null)} trend="negative" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <EquityCurveChart data={analytics.equityCurve} />
            <MonthlyPnlChart data={analytics.monthlyPnL} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PerformanceBarChart
              title="Rendimiento por ticker"
              description="Los instrumentos que más suman o restan a tu curva."
              data={analytics.resultsByTicker}
            />
            <PerformanceBarChart
              title="Rendimiento por setup"
              description="Qué estrategias te están dando edge real."
              data={analytics.resultsBySetup}
            />
          </section>
        </>
      )}
    </div>
  );
}
