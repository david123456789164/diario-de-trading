import Link from "next/link";

import { TradeImportCard } from "@/components/trades/trade-import-card";
import { TradeFiltersBar } from "@/components/trades/trade-filters";
import { TradesTable } from "@/components/trades/trades-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buildFilterMeta, filterTrades, paginateTrades, parseTradeFilters } from "@/lib/trading/filters";
import { getTradesForCurrentUser } from "@/lib/trading/queries";
import { getServerTranslation } from "@/src/i18n/server";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { t } = await getServerTranslation();
  const resolvedSearchParams = await searchParams;
  const filters = parseTradeFilters(resolvedSearchParams);
  const trades = await getTradesForCurrentUser();
  const filtered = filterTrades(trades, filters);
  const paginated = paginateTrades(filtered, filters.page);
  const meta = buildFilterMeta(trades);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trades.list.title")}
        description={t("trades.list.description")}
        actions={
          <Link href="/trades/new">
            <Button>{t("common.actions.newTrade")}</Button>
          </Link>
        }
      />

      <TradeImportCard />

      <TradeFiltersBar filters={filters} setups={meta.setups} />

      {filtered.length === 0 ? (
        <EmptyState
          title={t("trades.list.emptyTitle")}
          description={t("trades.list.emptyDescription")}
          actionHref={trades.length === 0 ? "/trades/new" : undefined}
          actionLabel={trades.length === 0 ? t("trades.list.emptyAction") : undefined}
        />
      ) : (
        <TradesTable items={paginated.items} page={paginated.page} totalPages={paginated.totalPages} />
      )}
    </div>
  );
}
