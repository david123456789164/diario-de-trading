import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfileRow, TradeRow } from "@/types/database";

export async function getTradesForCurrentUser() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los trades.");
  }

  return data satisfies TradeRow[];
}

export async function getTradeByIdForCurrentUser(id: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el trade solicitado.");
  }

  if (!data) {
    notFound();
  }

  return data as TradeRow;
}

export async function getProfileForCurrentUser() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data as ProfileRow | null;
}

export async function getSignedScreenshotUrl(path: string | null | undefined) {
  if (!path) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage.from("trade-screenshots").createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

