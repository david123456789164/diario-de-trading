import { defaultPageSize } from "@/lib/trading/constants";
import { computeTrade, matchesResultFilter, type ComputedTrade } from "@/lib/trading/calculations";
import { tradeFilterSchema, type TradeFilters } from "@/lib/trading/schemas";
import type { TradeRow } from "@/types/database";

type SearchParams = Record<string, string | string[] | undefined>;

function takeFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function includesTerm(haystack: string | null | undefined, needle: string) {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

export function parseTradeFilters(searchParams: SearchParams): TradeFilters {
  return tradeFilterSchema.parse({
    q: takeFirst(searchParams.q),
    setup: takeFirst(searchParams.setup),
    status: takeFirst(searchParams.status),
    direction: takeFirst(searchParams.direction),
    result: takeFirst(searchParams.result),
    from: takeFirst(searchParams.from),
    to: takeFirst(searchParams.to),
    sort: takeFirst(searchParams.sort),
    order: takeFirst(searchParams.order),
    page: takeFirst(searchParams.page),
  });
}

function sortTrades(trades: ComputedTrade[], filters: TradeFilters) {
  const direction = filters.order === "asc" ? 1 : -1;

  return [...trades].sort((a, b) => {
    const compareDates = (first: string | null, second: string | null) =>
      (new Date(first ?? 0).getTime() - new Date(second ?? 0).getTime()) * direction;

    switch (filters.sort) {
      case "ticker":
        return a.raw.ticker.localeCompare(b.raw.ticker) * direction;
      case "exit_date":
        return compareDates(a.raw.exit_date, b.raw.exit_date);
      case "created_at":
        return compareDates(a.raw.created_at, b.raw.created_at);
      case "net_pnl":
        return ((a.netPnL ?? Number.NEGATIVE_INFINITY) - (b.netPnL ?? Number.NEGATIVE_INFINITY)) * direction;
      case "realized_r":
        return ((a.realizedR ?? Number.NEGATIVE_INFINITY) - (b.realizedR ?? Number.NEGATIVE_INFINITY)) * direction;
      case "holding_days":
        return ((a.holdingDays ?? Number.NEGATIVE_INFINITY) - (b.holdingDays ?? Number.NEGATIVE_INFINITY)) * direction;
      case "entry_date":
      default:
        return compareDates(a.raw.entry_date, b.raw.entry_date);
    }
  });
}

export function filterTrades(trades: TradeRow[], filters: TradeFilters) {
  const query = filters.q.trim().toLowerCase();
  const fromDate = filters.from ? new Date(filters.from) : null;
  const toDate = filters.to ? new Date(filters.to) : null;

  const filtered = trades
    .map(computeTrade)
    .filter((trade) => {
      if (query) {
        const matched =
          includesTerm(trade.raw.ticker, query) ||
          includesTerm(trade.raw.setup, query) ||
          includesTerm(trade.raw.thesis, query) ||
          includesTerm(trade.raw.notes, query) ||
          includesTerm(trade.raw.mistakes, query) ||
          includesTerm(trade.raw.lesson_learned, query) ||
          trade.raw.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matched) return false;
      }

      if (filters.setup && trade.raw.setup !== filters.setup) return false;
      if (filters.status !== "all" && trade.raw.status !== filters.status) return false;
      if (filters.direction !== "all" && trade.raw.direction !== filters.direction) return false;
      if (!matchesResultFilter(trade, filters.result)) return false;

      const referenceDate = new Date(trade.raw.entry_date);
      if (fromDate && referenceDate < fromDate) return false;
      if (toDate) {
        const inclusiveTo = new Date(toDate);
        inclusiveTo.setHours(23, 59, 59, 999);
        if (referenceDate > inclusiveTo) return false;
      }

      return true;
    });

  return sortTrades(filtered, filters);
}

export function paginateTrades(trades: ComputedTrade[], page: number, pageSize = defaultPageSize) {
  const totalPages = Math.max(1, Math.ceil(trades.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: trades.slice(start, start + pageSize),
    totalPages,
    page: safePage,
    totalItems: trades.length,
  };
}

export function buildFilterMeta(trades: TradeRow[]) {
  const setups = [...new Set(trades.map((trade) => trade.setup))].sort((a, b) => a.localeCompare(b));
  const tickers = [...new Set(trades.map((trade) => trade.ticker))].sort((a, b) => a.localeCompare(b));

  return { setups, tickers };
}

