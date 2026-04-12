import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { buildTradesCsv } from "@/lib/trading/csv";
import { filterTrades, parseTradeFilters } from "@/lib/trading/filters";

export const preferredRegion = "fra1";

export async function GET(request: Request) {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const filters = parseTradeFilters(Object.fromEntries(url.searchParams.entries()));
  const { data, error } = await auth.supabase
    .from("trades")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron exportar los trades." }, { status: 400 });
  }

  const csv = buildTradesCsv(filterTrades(data, filters));

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trades-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
