import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export const preferredRegion = "fra1";

export async function POST(request: Request) {
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase.rpc("seed_demo_trades");
  if (error) {
    return NextResponse.json({ error: t("api.seedDemoError") }, { status: 400 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");

  return NextResponse.json({ inserted: data ?? 0 });
}
