import Link from "next/link";

import { TradeDetail } from "@/components/trades/trade-detail";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { computeTrade } from "@/lib/trading/calculations";
import { getSignedScreenshotUrl, getTradeByIdForCurrentUser } from "@/lib/trading/queries";

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await getTradeByIdForCurrentUser(id);
  const screenshotUrl = await getSignedScreenshotUrl(trade.screenshot_path);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle del trade"
        title={`${trade.ticker} · ${trade.setup}`}
        description="Revisión completa de datos, métricas, screenshot y aprendizaje registrado para esta operación."
        actions={
          <div className="flex gap-3">
            <Link href="/trades">
              <Button variant="secondary">Volver</Button>
            </Link>
            <Link href={`/trades/${trade.id}/edit`}>
              <Button>Editar trade</Button>
            </Link>
          </div>
        }
      />

      <TradeDetail trade={computeTrade(trade)} screenshotUrl={screenshotUrl} />
    </div>
  );
}

