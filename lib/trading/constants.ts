export const assetTypeOptions = [
  { value: "stock", label: "Acción" },
  { value: "etf", label: "ETF" },
] as const;

export const directionOptions = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;

export const tradeStatusOptions = [
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "invalidated", label: "Invalidado" },
] as const;

export const resultFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "winner", label: "Ganador" },
  { value: "loser", label: "Perdedor" },
  { value: "breakeven", label: "Break-even" },
] as const;

export const tradeSortOptions = [
  { value: "entry_date", label: "Fecha de entrada" },
  { value: "exit_date", label: "Fecha de salida" },
  { value: "created_at", label: "Fecha de creación" },
  { value: "ticker", label: "Ticker" },
  { value: "net_pnl", label: "P&L neto" },
  { value: "realized_r", label: "R realizado" },
  { value: "holding_days", label: "Holding days" },
] as const;

export const defaultPageSize = 12;

