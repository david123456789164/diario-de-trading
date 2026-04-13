import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export const preferredRegion = "fra1";

function revalidateTradingPaths(id: string) {
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath(`/trades/${id}`);
  revalidatePath(`/trades/${id}/edit`);
}

async function getTradeForImage(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  id: string,
) {
  const { data, error } = await (supabase.from("trades") as any)
    .select("id, screenshot_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { id: string; screenshot_path: string | null };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const trade = await getTradeForImage(auth.supabase, auth.user.id, id);
  if (!trade) {
    return NextResponse.json({ error: t("api.tradeNotFound") }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: t("api.noFile") }, { status: 400 });
  }

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: t("api.invalidFileFormat") }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: t("api.fileTooLarge") }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/webp" ? "webp" : "jpg");
  const path = `${auth.user.id}/${id}-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const upload = await auth.supabase.storage.from("trade-screenshots").upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (upload.error) {
    return NextResponse.json({ error: t("api.uploadImageError") }, { status: 400 });
  }

  const update = await (auth.supabase.from("trades") as any)
    .update({
      screenshot_path: path,
      screenshot_file_name: file.name,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (update.error) {
    await auth.supabase.storage.from("trade-screenshots").remove([path]);
    return NextResponse.json({ error: t("api.linkImageError") }, { status: 400 });
  }

  if (trade.screenshot_path) {
    await auth.supabase.storage.from("trade-screenshots").remove([trade.screenshot_path]);
  }

  revalidateTradingPaths(id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const trade = await getTradeForImage(auth.supabase, auth.user.id, id);
  if (!trade) {
    return NextResponse.json({ error: t("api.tradeNotFound") }, { status: 404 });
  }

  if (trade.screenshot_path) {
    await auth.supabase.storage.from("trade-screenshots").remove([trade.screenshot_path]);
  }

  const { error } = await (auth.supabase.from("trades") as any)
    .update({
      screenshot_path: null,
      screenshot_file_name: null,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: t("api.deleteImageError") }, { status: 400 });
  }

  revalidateTradingPaths(id);
  return NextResponse.json({ success: true });
}
