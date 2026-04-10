import Link from "next/link";

import { TradeFiltersBar } from "@/components/trades/trade-filters";
import { TradesTable } from "@/components/trades/trades-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buildFilterMeta, filterTrades, paginateTrades, parseTradeFilters } from "@/lib/trading/filters";
import { getTradesForCurrentUser } from "@/lib/trading/queries";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseTradeFilters(resolvedSearchParams);
  const trades = await getTradesForCurrentUser();
  const filtered = filterTrades(trades, filters);
  const paginated = paginateTrades(filtered, filters.page);
  const meta = buildFilterMeta(trades);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registro"
        title="Trades"
        description="Lista completa de operaciones con búsqueda, filtros, orden y acceso al detalle."
        actions={
          <Link href="/trades/new">
            <Button>Nuevo trade</Button>
          </Link>
        }
      />

      <TradeFiltersBar filters={filters} setups={meta.setups} />

      {filtered.length === 0 ? (
        <EmptyState
          title="No encontramos trades con esos filtros"
          description="Ajusta la búsqueda o limpia los filtros para volver a ver todas tus operaciones."
          actionHref={trades.length === 0 ? "/trades/new" : undefined}
          actionLabel={trades.length === 0 ? "Crear primer trade" : undefined}
        />
      ) : (
        <TradesTable items={paginated.items} page={paginated.page} totalPages={paginated.totalPages} />
      )}
    </div>
  );
}

