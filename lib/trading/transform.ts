import type { TradeInsert, TradeUpdate } from "@/types/database";
import type { TradePayload as PayloadInput } from "@/lib/trading/schemas";

type WritableTrade = Omit<TradeInsert, "user_id">;

function cleanText(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapPayloadToTradeRecord(payload: PayloadInput): WritableTrade {
  return {
    ticker: payload.ticker.toUpperCase().trim(),
    asset_type: payload.assetType,
    direction: payload.direction,
    setup: payload.setup.trim(),
    entry_date: payload.entryDate,
    exit_date: payload.exitDate,
    entry_price: payload.entryPrice,
    exit_price: payload.exitPrice,
    initial_stop_loss: payload.initialStopLoss,
    initial_take_profit: payload.initialTakeProfit,
    quantity: payload.quantity,
    fees: payload.fees,
    account_size: payload.accountSize,
    planned_risk_amount: payload.plannedRiskAmount,
    thesis: cleanText(payload.thesis),
    notes: cleanText(payload.notes),
    mistakes: cleanText(payload.mistakes),
    lesson_learned: cleanText(payload.lessonLearned),
    status: payload.status,
    tags: payload.tags.length > 0 ? payload.tags : [],
  };
}

export function mapPayloadToInsert(payload: PayloadInput, userId: string): TradeInsert {
  return {
    ...mapPayloadToTradeRecord(payload),
    user_id: userId,
  };
}

export function mapPayloadToUpdate(payload: PayloadInput): TradeUpdate {
  return {
    ...mapPayloadToTradeRecord(payload),
  };
}
