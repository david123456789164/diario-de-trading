export const assetTypeOptions = [
  { value: "stock", labelKey: "trades.assetType.stock" },
  { value: "etf", labelKey: "trades.assetType.etf" },
] as const;

export const directionOptions = [
  { value: "long", labelKey: "trades.direction.long" },
  { value: "short", labelKey: "trades.direction.short" },
] as const;

export const tradeStatusOptions = [
  { value: "open", labelKey: "trades.status.open" },
  { value: "closed", labelKey: "trades.status.closed" },
  { value: "cancelled", labelKey: "trades.status.cancelled" },
  { value: "invalidated", labelKey: "trades.status.invalidated" },
] as const;

export const resultFilterOptions = [
  { value: "all", labelKey: "trades.resultFilter.all" },
  { value: "winner", labelKey: "trades.resultFilter.winner" },
  { value: "loser", labelKey: "trades.resultFilter.loser" },
  { value: "breakeven", labelKey: "trades.resultFilter.breakeven" },
] as const;

export const tradeSortOptions = [
  { value: "entry_date", labelKey: "trades.sort.entry_date" },
  { value: "exit_date", labelKey: "trades.sort.exit_date" },
  { value: "created_at", labelKey: "trades.sort.created_at" },
  { value: "ticker", labelKey: "trades.sort.ticker" },
  { value: "net_pnl", labelKey: "trades.sort.net_pnl" },
  { value: "realized_r", labelKey: "trades.sort.realized_r" },
  { value: "holding_days", labelKey: "trades.sort.holding_days" },
] as const;

export const defaultPageSize = 12;
