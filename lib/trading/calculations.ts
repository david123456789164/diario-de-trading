import { differenceInCalendarDays } from "date-fns";

import type { AppLocale } from "@/src/i18n/settings";
import type { TradeRow } from "@/types/database";

export type TradeOutcome = "winner" | "loser" | "breakeven" | "pending";

export type ComputedTrade = {
  id: string;
  raw: TradeRow;
  entryValue: number;
  grossPnL: number | null;
  netPnL: number | null;
  pnlPercent: number | null;
  riskPerShare: number | null;
  riskTotal: number | null;
  rewardPotential: number | null;
  plannedRiskReward: number | null;
  realizedR: number | null;
  holdingDays: number | null;
  isClosed: boolean;
  outcome: TradeOutcome;
};

export type TradingAnalytics = {
  allTrades: ComputedTrade[];
  closedTrades: ComputedTrade[];
  openTrades: ComputedTrade[];
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  profitFactor: number | null;
  expectancy: number;
  averageWinner: number;
  averageLoser: number;
  averageR: number;
  averageHoldingDays: number;
  totalWon: number;
  totalLost: number;
  totalNetPnL: number;
  totalGrossPnL: number;
  maxDrawdown: number;
  equityCurve: Array<{ date: string; label: string; equity: number; drawdown: number }>;
  monthlyPnL: Array<{ month: string; label: string; pnl: number; trades: number; winRate: number }>;
  resultsByTicker: Array<{ name: string; pnl: number; trades: number; winRate: number }>;
  resultsBySetup: Array<{ name: string; pnl: number; trades: number; winRate: number }>;
  longsVsShorts: Array<{ side: "Long" | "Short"; pnl: number; trades: number; winRate: number }>;
  rDistribution: Array<{ bucket: string; count: number }>;
  bestTrade: ComputedTrade | null;
  worstTrade: ComputedTrade | null;
};

function asNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function groupPerformance(trades: ComputedTrade[], keySelector: (trade: ComputedTrade) => string) {
  const map = new Map<string, { name: string; pnl: number; trades: number; wins: number }>();

  trades.forEach((trade) => {
    const key = keySelector(trade);
    const current = map.get(key) ?? { name: key, pnl: 0, trades: 0, wins: 0 };
    current.pnl += trade.netPnL ?? 0;
    current.trades += 1;
    current.wins += trade.outcome === "winner" ? 1 : 0;
    map.set(key, current);
  });

  return [...map.values()]
    .map((item) => ({
      ...item,
      pnl: round(item.pnl),
      winRate: item.trades > 0 ? round((item.wins / item.trades) * 100) : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

function buildRDistribution(trades: ComputedTrade[]) {
  const buckets = new Map<string, number>();
  ["<= -2R", "-2R / -1R", "-1R / 0R", "0R / 1R", "1R / 2R", ">= 2R"].forEach((label) =>
    buckets.set(label, 0),
  );

  trades.forEach((trade) => {
    if (trade.realizedR === null) return;
    const r = trade.realizedR;
    let bucket = "0R / 1R";

    if (r <= -2) bucket = "<= -2R";
    else if (r <= -1) bucket = "-2R / -1R";
    else if (r < 0) bucket = "-1R / 0R";
    else if (r < 1) bucket = "0R / 1R";
    else if (r < 2) bucket = "1R / 2R";
    else bucket = ">= 2R";

    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  });

  return [...buckets.entries()].map(([bucket, count]) => ({ bucket, count }));
}

function formatChartMonth(date: Date, locale: AppLocale, year: "2-digit" | "numeric") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year,
  }).format(date);
}

function sortClosedTradesForEquity(trades: ComputedTrade[]) {
  return [...trades].sort((a, b) => {
    const dateA = a.raw.exit_date ?? a.raw.entry_date;
    const dateB = b.raw.exit_date ?? b.raw.entry_date;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
}

export function computeTrade(trade: TradeRow): ComputedTrade {
  const entryPrice = asNumber(trade.entry_price) ?? 0;
  const exitPrice = asNumber(trade.exit_price);
  const quantity = asNumber(trade.quantity) ?? 0;
  const fees = asNumber(trade.fees) ?? 0;
  const stopLoss = asNumber(trade.initial_stop_loss);
  const takeProfit = asNumber(trade.initial_take_profit);
  const isClosed = trade.status === "closed" && exitPrice !== null && !!trade.exit_date;

  const grossPnL = isClosed
    ? trade.direction === "short"
      ? (entryPrice - exitPrice) * quantity
      : (exitPrice - entryPrice) * quantity
    : null;

  const netPnL = grossPnL === null ? null : grossPnL - fees;
  const entryValue = entryPrice * quantity;
  const riskPerShare =
    stopLoss === null || !Number.isFinite(stopLoss) ? null : Math.abs(entryPrice - stopLoss);
  const riskTotal = riskPerShare === null ? null : riskPerShare * quantity;
  const rewardPotential =
    takeProfit === null || !Number.isFinite(takeProfit) ? null : Math.abs(takeProfit - entryPrice) * quantity;
  const plannedRiskReward =
    riskTotal && rewardPotential !== null && riskTotal > 0 ? rewardPotential / riskTotal : null;
  const pnlPercent = netPnL !== null && entryValue > 0 ? (netPnL / entryValue) * 100 : null;
  const realizedR = netPnL !== null && riskTotal && riskTotal > 0 ? netPnL / riskTotal : null;
  const holdingDays =
    isClosed && trade.exit_date
      ? differenceInCalendarDays(new Date(trade.exit_date), new Date(trade.entry_date))
      : null;

  let outcome: TradeOutcome = "pending";
  if (isClosed && netPnL !== null) {
    if (netPnL > 0) outcome = "winner";
    else if (netPnL < 0) outcome = "loser";
    else outcome = "breakeven";
  }

  return {
    id: trade.id,
    raw: trade,
    entryValue: round(entryValue),
    grossPnL: grossPnL === null ? null : round(grossPnL),
    netPnL: netPnL === null ? null : round(netPnL),
    pnlPercent: pnlPercent === null ? null : round(pnlPercent),
    riskPerShare: riskPerShare === null ? null : round(riskPerShare),
    riskTotal: riskTotal === null ? null : round(riskTotal),
    rewardPotential: rewardPotential === null ? null : round(rewardPotential),
    plannedRiskReward: plannedRiskReward === null ? null : round(plannedRiskReward),
    realizedR: realizedR === null ? null : round(realizedR),
    holdingDays,
    isClosed,
    outcome,
  };
}

export function buildAnalytics(trades: TradeRow[], locale: AppLocale = "es"): TradingAnalytics {
  const computed = trades.map(computeTrade);
  const closedTrades = computed.filter((trade) => trade.isClosed);
  const openTrades = computed.filter((trade) => trade.raw.status === "open");
  const winners = closedTrades.filter((trade) => trade.outcome === "winner");
  const losers = closedTrades.filter((trade) => trade.outcome === "loser");
  const breakevens = closedTrades.filter((trade) => trade.outcome === "breakeven");
  const totalWon = winners.reduce((sum, trade) => sum + (trade.netPnL ?? 0), 0);
  const totalLost = losers.reduce((sum, trade) => sum + (trade.netPnL ?? 0), 0);
  const totalNetPnL = closedTrades.reduce((sum, trade) => sum + (trade.netPnL ?? 0), 0);
  const totalGrossPnL = closedTrades.reduce((sum, trade) => sum + (trade.grossPnL ?? 0), 0);
  const averageWinner = winners.length > 0 ? totalWon / winners.length : 0;
  const averageLoser = losers.length > 0 ? totalLost / losers.length : 0;
  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;
  const profitFactor = losers.length > 0 ? totalWon / Math.abs(totalLost) : winners.length > 0 ? null : 0;
  const expectancy =
    closedTrades.length > 0
      ? (winRate / 100) * averageWinner - (1 - winRate / 100) * Math.abs(averageLoser)
      : 0;
  const realizedRValues = closedTrades.map((trade) => trade.realizedR).filter((value): value is number => value !== null);
  const averageR =
    realizedRValues.length > 0
      ? realizedRValues.reduce((sum, value) => sum + value, 0) / realizedRValues.length
      : 0;
  const holdingDaysValues = closedTrades
    .map((trade) => trade.holdingDays)
    .filter((value): value is number => value !== null);
  const averageHoldingDays =
    holdingDaysValues.length > 0
      ? holdingDaysValues.reduce((sum, value) => sum + value, 0) / holdingDaysValues.length
      : 0;

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  const equityCurve = sortClosedTradesForEquity(closedTrades).map((trade) => {
    equity += trade.netPnL ?? 0;
    peak = Math.max(peak, equity);
    const drawdown = equity - peak;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
    const equityDate = trade.raw.exit_date ?? trade.raw.entry_date;

    return {
      date: equityDate,
      label: formatChartMonth(new Date(equityDate), locale, "2-digit"),
      equity: round(equity),
      drawdown: round(drawdown),
    };
  });

  const monthMap = new Map<string, { month: string; label: string; pnl: number; trades: number; wins: number }>();
  closedTrades.forEach((trade) => {
    const baseDate = trade.raw.exit_date ?? trade.raw.entry_date;
    const date = new Date(baseDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatChartMonth(date, locale, "numeric");
    const current = monthMap.get(month) ?? { month, label, pnl: 0, trades: 0, wins: 0 };
    current.pnl += trade.netPnL ?? 0;
    current.trades += 1;
    current.wins += trade.outcome === "winner" ? 1 : 0;
    monthMap.set(month, current);
  });

  const monthlyPnL = [...monthMap.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      month: item.month,
      label: item.label,
      pnl: round(item.pnl),
      trades: item.trades,
      winRate: item.trades > 0 ? round((item.wins / item.trades) * 100) : 0,
    }));

  const longsVsShorts = ["long", "short"].map((direction) => {
    const directionTrades = closedTrades.filter((trade) => trade.raw.direction === direction);
    const directionWins = directionTrades.filter((trade) => trade.outcome === "winner").length;
    return {
      side: direction === "long" ? ("Long" as const) : ("Short" as const),
      pnl: round(directionTrades.reduce((sum, trade) => sum + (trade.netPnL ?? 0), 0)),
      trades: directionTrades.length,
      winRate: directionTrades.length > 0 ? round((directionWins / directionTrades.length) * 100) : 0,
    };
  });

  const bestTrade = closedTrades.length > 0 ? [...closedTrades].sort((a, b) => (b.netPnL ?? 0) - (a.netPnL ?? 0))[0] : null;
  const worstTrade = closedTrades.length > 0 ? [...closedTrades].sort((a, b) => (a.netPnL ?? 0) - (b.netPnL ?? 0))[0] : null;

  return {
    allTrades: computed,
    closedTrades,
    openTrades,
    wins: winners.length,
    losses: losers.length,
    breakevens: breakevens.length,
    winRate: round(winRate),
    profitFactor: profitFactor === null ? null : round(profitFactor),
    expectancy: round(expectancy),
    averageWinner: round(averageWinner),
    averageLoser: round(averageLoser),
    averageR: round(averageR),
    averageHoldingDays: round(averageHoldingDays),
    totalWon: round(totalWon),
    totalLost: round(totalLost),
    totalNetPnL: round(totalNetPnL),
    totalGrossPnL: round(totalGrossPnL),
    maxDrawdown: Math.abs(round(maxDrawdown)),
    equityCurve,
    monthlyPnL,
    resultsByTicker: groupPerformance(closedTrades, (trade) => trade.raw.ticker).slice(0, 8),
    resultsBySetup: groupPerformance(closedTrades, (trade) => trade.raw.setup).slice(0, 8),
    longsVsShorts,
    rDistribution: buildRDistribution(closedTrades),
    bestTrade,
    worstTrade,
  };
}

export function matchesResultFilter(trade: ComputedTrade, result: "all" | "winner" | "loser" | "breakeven") {
  if (result === "all") return true;
  return trade.outcome === result;
}
