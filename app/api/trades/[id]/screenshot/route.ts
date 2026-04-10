import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const trade = await getTradeForImage(auth.supabase, auth.user.id, id);
  if (!trade) {
    return NextResponse.json({ error: "Trade no encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido. Usa PNG, JPG o WEBP." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen supera el máximo de 5 MB." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/webp" ? "webp" : "jpg");
  const path = `${auth.user.id}/${id}-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const upload = await auth.supabase.storage.from("trade-screenshots").upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (upload.error) {
    return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 400 });
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
    return NextResponse.json({ error: "La imagen se subió, pero no se pudo vincular al trade." }, { status: 400 });
  }

  if (trade.screenshot_path) {
    await auth.supabase.storage.from("trade-screenshots").remove([trade.screenshot_path]);
  }

  revalidateTradingPaths(id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const trade = await getTradeForImage(auth.supabase, auth.user.id, id);
  if (!trade) {
    return NextResponse.json({ error: "Trade no encontrado." }, { status: 404 });
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
    return NextResponse.json({ error: "No se pudo eliminar la imagen." }, { status: 400 });
  }

  revalidateTradingPaths(id);
  return NextResponse.json({ success: true });
}
