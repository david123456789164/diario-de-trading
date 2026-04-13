import { formatDate } from "@/lib/utils/format";
import type { ComputedTrade } from "@/lib/trading/calculations";
import type { AppLocale } from "@/src/i18n/settings";

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

export function buildTradesCsv(trades: ComputedTrade[], t: (key: string) => string, locale: AppLocale) {
  const header = [
    "ticker",
    "asset",
    "direction",
    "setup",
    "status",
    "entryDate",
    "exitDate",
    "entryPrice",
    "exitPrice",
    "quantity",
    "fees",
    "grossPnl",
    "netPnl",
    "pnlPercent",
    "totalRisk",
    "potentialReward",
    "plannedRr",
    "realizedR",
    "holdingDays",
    "tags",
  ].map((key) => t(`csv.headers.${key}`));

  const rows = trades.map((trade) => [
    trade.raw.ticker,
    t(`trades.assetType.${trade.raw.asset_type}`),
    t(`trades.direction.${trade.raw.direction}`),
    trade.raw.setup,
    t(`trades.status.${trade.raw.status}`),
    formatDate(trade.raw.entry_date, "", locale),
    formatDate(trade.raw.exit_date, "", locale),
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
