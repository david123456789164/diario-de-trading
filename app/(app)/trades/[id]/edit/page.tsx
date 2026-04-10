import { TradeForm } from "@/components/trades/trade-form";
import { PageHeader } from "@/components/ui/page-header";
import { getSignedScreenshotUrl, getTradeByIdForCurrentUser } from "@/lib/trading/queries";

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await getTradeByIdForCurrentUser(id);
  const screenshotUrl = await getSignedScreenshotUrl(trade.screenshot_path);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edición"
        title={`Editar ${trade.ticker}`}
        description="Actualiza datos, notas, errores o screenshot sin perder el historial de creación."
      />

      <TradeForm
        mode="edit"
        tradeId={trade.id}
        initialValues={{
          ticker: trade.ticker,
          assetType: trade.asset_type as "stock" | "etf",
          direction: trade.direction as "long" | "short",
          setup: trade.setup,
          entryDate: trade.entry_date,
          exitDate: trade.exit_date,
          entryPrice: trade.entry_price,
          exitPrice: trade.exit_price,
          initialStopLoss: trade.initial_stop_loss,
          initialTakeProfit: trade.initial_take_profit,
          quantity: trade.quantity,
          fees: trade.fees,
          accountSize: trade.account_size,
          plannedRiskAmount: trade.planned_risk_amount,
          thesis: trade.thesis,
          notes: trade.notes,
          mistakes: trade.mistakes,
          lessonLearned: trade.lesson_learned,
          status: trade.status as "open" | "closed" | "cancelled" | "invalidated",
          tags: trade.tags ?? [],
          existingImageUrl: screenshotUrl,
          existingImageFileName: trade.screenshot_file_name,
        }}
      />
    </div>
  );
}

