import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireRouteUser } from "@/lib/auth/route-user";

export const preferredRegion = "fra1";

export async function POST() {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase.rpc("seed_demo_trades");
  if (error) {
    return NextResponse.json({ error: "No se pudieron insertar los datos demo." }, { status: 400 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");

  return NextResponse.json({ inserted: data ?? 0 });
}
