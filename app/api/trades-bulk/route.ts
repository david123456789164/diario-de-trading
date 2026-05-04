import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export const preferredRegion = "fra1";

function revalidateTradingPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");
}

export async function DELETE(request: Request) {
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;

  const tradesTable = auth.supabase.from("trades") as any;
  const { data: existingTrades, error: fetchError } = await tradesTable
    .select("id, screenshot_path")
    .eq("user_id", auth.user.id);

  if (fetchError || !existingTrades) {
    return NextResponse.json({ error: t("api.deleteAllTradesError") }, { status: 400 });
  }

  const screenshotPaths = existingTrades
    .map((trade: { screenshot_path: string | null }) => trade.screenshot_path)
    .filter((path: string | null): path is string => Boolean(path));

  if (screenshotPaths.length > 0) {
    await auth.supabase.storage.from("trade-screenshots").remove(screenshotPaths);
  }

  const { error: deleteError } = await tradesTable.delete().eq("user_id", auth.user.id);

  if (deleteError) {
    return NextResponse.json({ error: t("api.deleteAllTradesError") }, { status: 400 });
  }

  revalidateTradingPaths();
  return NextResponse.json({ deleted: existingTrades.length });
}
