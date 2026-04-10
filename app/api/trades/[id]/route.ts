import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireRouteUser } from "@/lib/auth/route-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { tradePayloadSchema } from "@/lib/trading/schemas";
import { mapPayloadToUpdate } from "@/lib/trading/transform";

function revalidateTradingPaths(id: string) {
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");
  revalidatePath(`/trades/${id}`);
  revalidatePath(`/trades/${id}/edit`);
}

async function getExistingTrade(
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    const payload = tradePayloadSchema.parse(await request.json());
    const existing = await getExistingTrade(auth.supabase, auth.user.id, id);

    if (!existing) {
      return NextResponse.json({ error: "Trade no encontrado." }, { status: 404 });
    }

    const { data, error } = await (auth.supabase.from("trades") as any)
      .update(mapPayloadToUpdate(payload))
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No se pudo actualizar el trade." }, { status: 400 });
    }

    revalidateTradingPaths(id);
    return NextResponse.json({ trade: data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Revisa los campos del formulario.",
          fieldErrors: error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ error: "Error inesperado al actualizar el trade." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const existing = await getExistingTrade(auth.supabase, auth.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Trade no encontrado." }, { status: 404 });
  }

  if (existing.screenshot_path) {
    await auth.supabase.storage.from("trade-screenshots").remove([existing.screenshot_path]);
  }

  const { error } = await (auth.supabase.from("trades") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);
  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el trade." }, { status: 400 });
  }

  revalidateTradingPaths(id);
  return NextResponse.json({ success: true });
}
