import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireRouteUser } from "@/lib/auth/route-user";
import { createTradePayloadSchema } from "@/lib/trading/schemas";
import { mapPayloadToInsert } from "@/lib/trading/transform";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export const preferredRegion = "fra1";

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
  const { t } = getTranslationForLanguage(getRequestLanguage(request));
  const auth = await requireRouteUser(request);
  if ("error" in auth) return auth.error;

  try {
    const payload = createTradePayloadSchema(t).parse(await request.json());
    const tradesTable = auth.supabase.from("trades") as any;
    const { data, error } = await tradesTable
      .insert(mapPayloadToInsert(payload, auth.user.id))
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: t("api.createTradeError") }, { status: 400 });
    }

    revalidateTradingPaths(data.id);
    return NextResponse.json({ trade: data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: t("api.reviewForm"),
          fieldErrors: error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ error: t("api.createUnexpected") }, { status: 500 });
  }
}
