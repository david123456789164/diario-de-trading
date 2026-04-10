"use client";

import { Download, FilterX, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { directionOptions, resultFilterOptions, tradeSortOptions, tradeStatusOptions } from "@/lib/trading/constants";
import type { TradeFilters } from "@/lib/trading/schemas";

export function TradeFiltersBar({
  filters,
  setups,
}: {
  filters: TradeFilters;
  setups: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localQuery, setLocalQuery] = useState(filters.q);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return `/api/trades/export?${params.toString()}`;
  }, [searchParams]);

  function updateParams(nextValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q: localQuery });
  }

  function handleClear() {
    setLocalQuery("");
    router.push(pathname);
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form className="flex flex-1 gap-3" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Buscar por ticker, setup, nota o tag..."
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Aplicar
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleClear}>
            <FilterX className="h-4 w-4" />
            Limpiar
          </Button>
          <a href={exportHref}>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select value={filters.setup} onChange={(event) => updateParams({ setup: event.target.value })}>
          <option value="">Todos los setups</option>
          {setups.map((setup) => (
            <option key={setup} value={setup}>
              {setup}
            </option>
          ))}
        </Select>

        <Select value={filters.status} onChange={(event) => updateParams({ status: event.target.value })}>
          <option value="all">Todos los estados</option>
          {tradeStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select value={filters.direction} onChange={(event) => updateParams({ direction: event.target.value })}>
          <option value="all">Long y short</option>
          {directionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select value={filters.result} onChange={(event) => updateParams({ result: event.target.value })}>
          {resultFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input type="date" value={filters.from} onChange={(event) => updateParams({ from: event.target.value })} />
        <Input type="date" value={filters.to} onChange={(event) => updateParams({ to: event.target.value })} />
        <Select value={filters.sort} onChange={(event) => updateParams({ sort: event.target.value })}>
          {tradeSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Ordenar por: {option.label}
            </option>
          ))}
        </Select>
        <Select value={filters.order} onChange={(event) => updateParams({ order: event.target.value })}>
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </Select>
      </div>
    </Card>
  );
}

