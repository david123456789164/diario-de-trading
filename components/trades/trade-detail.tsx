import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ComputedTrade } from "@/lib/trading/calculations";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatHoldingDays,
  formatNumber,
  formatPercent,
  formatRatio,
} from "@/lib/utils/format";

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="subtle-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-text">{value}</p>
    </div>
  );
}

function Block({ title, content }: { title: string; content?: string | null }) {
  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted">{content || "Sin contenido."}</p>
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
  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold text-text">{trade.raw.ticker}</h2>
              <Badge tone={trade.raw.direction === "long" ? "positive" : "warning"}>
                {trade.raw.direction === "long" ? "Long" : "Short"}
              </Badge>
              <Badge tone={trade.raw.status === "closed" ? "positive" : trade.raw.status === "open" ? "info" : "warning"}>
                {trade.raw.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(trade.raw.tags ?? []).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted">
              Setup: <span className="text-text">{trade.raw.setup}</span>
            </p>
          </div>

          <div className="text-right">
            <p className={`text-3xl font-semibold ${trade.netPnL && trade.netPnL < 0 ? "text-danger" : "text-accent"}`}>
              {formatCurrency(trade.netPnL)}
            </p>
            <p className="mt-1 text-sm text-muted">P&amp;L neto realizado</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailMetric label="P&L bruto" value={formatCurrency(trade.grossPnL)} />
          <DetailMetric label="P&L %" value={formatPercent(trade.pnlPercent)} />
          <DetailMetric label="R realizado" value={formatRatio(trade.realizedR)} />
          <DetailMetric label="Holding days" value={formatHoldingDays(trade.holdingDays)} />
          <DetailMetric label="Riesgo total" value={formatCurrency(trade.riskTotal)} />
          <DetailMetric label="Reward potencial" value={formatCurrency(trade.rewardPotential)} />
          <DetailMetric label="RR planeado" value={formatRatio(trade.plannedRiskReward)} />
          <DetailMetric label="Fees" value={formatCurrency(trade.raw.fees)} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailMetric label="Fecha de entrada" value={formatDate(trade.raw.entry_date)} />
            <DetailMetric label="Fecha de salida" value={formatDate(trade.raw.exit_date)} />
            <DetailMetric label="Cantidad" value={formatNumber(trade.raw.quantity, 0)} />
            <DetailMetric label="Precio de entrada" value={formatCurrency(trade.raw.entry_price)} />
            <DetailMetric label="Precio de salida" value={formatCurrency(trade.raw.exit_price)} />
            <DetailMetric label="Tamaño de cuenta" value={formatCurrency(trade.raw.account_size)} />
            <DetailMetric label="Activo" value={trade.raw.asset_type.toUpperCase()} />
            <DetailMetric label="Stop loss inicial" value={formatCurrency(trade.raw.initial_stop_loss)} />
            <DetailMetric label="Take profit inicial" value={formatCurrency(trade.raw.initial_take_profit)} />
            <DetailMetric label="Riesgo planeado" value={formatCurrency(trade.raw.planned_risk_amount)} />
            <DetailMetric label="Creado" value={formatDateTime(trade.raw.created_at)} />
            <DetailMetric label="Actualizado" value={formatDateTime(trade.raw.updated_at)} />
          </Card>

          <Block title="Tesis de entrada" content={trade.raw.thesis} />
          <Block title="Notas" content={trade.raw.notes} />
          <Block title="Errores cometidos" content={trade.raw.mistakes} />
          <Block title="Aprendizaje" content={trade.raw.lesson_learned} />
        </div>

        <Card className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text">Screenshot</h3>
            <p className="text-sm text-muted">Captura asociada al trade para revisar contexto y ejecución.</p>
          </div>

          {screenshotUrl ? (
            <div className="overflow-hidden rounded-3xl border border-stroke">
              <img src={screenshotUrl} alt={`Screenshot del trade ${trade.raw.ticker}`} className="w-full object-cover" />
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-stroke bg-background/40 text-sm text-muted">
              No hay screenshot cargado.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

