import { formatDate } from "@/lib/utils/format";
import type { ComputedTrade } from "@/lib/trading/calculations";

function escapeCsvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function buildTradesCsv(trades: ComputedTrade[]) {
  const header = [
    "Ticker",
    "Activo",
    "Dirección",
    "Setup",
    "Estado",
    "Fecha entrada",
    "Fecha salida",
    "Precio entrada",
    "Precio salida",
    "Cantidad",
    "Fees",
    "P&L bruto",
    "P&L neto",
    "P&L %",
    "Riesgo total",
    "Reward potencial",
    "RR planeado",
    "R realizado",
    "Holding days",
    "Etiquetas",
  ];

  const rows = trades.map((trade) => [
    trade.raw.ticker,
    trade.raw.asset_type,
    trade.raw.direction,
    trade.raw.setup,
    trade.raw.status,
    formatDate(trade.raw.entry_date, ""),
    formatDate(trade.raw.exit_date, ""),
    trade.raw.entry_price,
    trade.raw.exit_price,
    trade.raw.quantity,
    trade.raw.fees,
    trade.grossPnL,
    trade.netPnL,
    trade.pnlPercent,
    trade.riskTotal,
    trade.rewardPotential,
    trade.plannedRiskReward,
    trade.realizedR,
    trade.holdingDays,
    trade.raw.tags?.join(" | ") ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

