import Link from "next/link";

import { TradeDetail } from "@/components/trades/trade-detail";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { computeTrade } from "@/lib/trading/calculations";
import { getSignedScreenshotUrl, getTradeByIdForCurrentUser } from "@/lib/trading/queries";
import { getServerTranslation } from "@/src/i18n/server";

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getServerTranslation();
  const { id } = await params;
  const trade = await getTradeByIdForCurrentUser(id);
  const screenshotUrl = await getSignedScreenshotUrl(trade.screenshot_path);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${trade.ticker} · ${trade.setup}`}
        description={t("trades.detailPage.description")}
        actions={
          <div className="flex gap-3">
            <Link href="/trades">
              <Button variant="secondary">{t("common.actions.back")}</Button>
            </Link>
            <Link href={`/trades/${trade.id}/edit`}>
              <Button>{t("trades.detailPage.editAction")}</Button>
            </Link>
          </div>
        }
      />

      <TradeDetail trade={computeTrade(trade)} screenshotUrl={screenshotUrl} />
    </div>
  );
}
