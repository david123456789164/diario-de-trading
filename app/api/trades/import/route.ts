import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { parseTradesCsvImport } from "@/lib/trading/import-csv";
import { mapPayloadToInsert } from "@/lib/trading/transform";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export const preferredRegion = "fra1";

const maxImportRows = 500;
const maxCsvBytes = 1024 * 1024;

function revalidateTradingPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");
}

export async function POST(request: Request) {
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: t("import.errors.noFile") }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json({ error: t("import.errors.invalidFile") }, { status: 400 });
  }

  if (file.size > maxCsvBytes) {
    return NextResponse.json({ error: t("import.errors.fileTooLarge") }, { status: 400 });
  }

  const parsed = parseTradesCsvImport(await file.text(), t);

  if (parsed.trades.length > maxImportRows) {
    return NextResponse.json(
      { error: t("import.errors.tooManyRows", { max: maxImportRows }) },
      { status: 400 },
    );
  }

  if (parsed.errors.length > 0) {
    return NextResponse.json({ errors: parsed.errors }, { status: 422 });
  }

  if (parsed.trades.length === 0) {
    return NextResponse.json({ error: t("import.errors.emptyFile") }, { status: 400 });
  }

  const tradesTable = auth.supabase.from("trades") as any;
  const { data, error } = await tradesTable
    .insert(parsed.trades.map((trade) => mapPayloadToInsert(trade, auth.user.id)))
    .select("id");

  if (error || !data) {
    return NextResponse.json({ error: t("import.errors.insertFailed") }, { status: 400 });
  }

  revalidateTradingPaths();
  return NextResponse.json({ imported: data.length }, { status: 201 });
}
