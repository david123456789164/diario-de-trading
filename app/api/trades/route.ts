import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireRouteUser } from "@/lib/auth/route-user";
import { tradePayloadSchema } from "@/lib/trading/schemas";
import { mapPayloadToInsert } from "@/lib/trading/transform";

function revalidateTradingPaths(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/analytics");
  revalidatePath("/settings");
  if (id) {
    revalidatePath(`/trades/${id}`);
    revalidatePath(`/trades/${id}/edit`);
  }
}

export async function POST(request: Request) {
  const auth = await requireRouteUser();
  if ("error" in auth) return auth.error;

  try {
    const payload = tradePayloadSchema.parse(await request.json());
    const tradesTable = auth.supabase.from("trades") as any;
    const { data, error } = await tradesTable
      .insert(mapPayloadToInsert(payload, auth.user.id))
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No se pudo crear el trade." }, { status: 400 });
    }

    revalidateTradingPaths(data.id);
    return NextResponse.json({ trade: data }, { status: 201 });
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

    return NextResponse.json({ error: "Error inesperado al crear el trade." }, { status: 500 });
  }
}
