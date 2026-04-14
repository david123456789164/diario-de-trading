import { NextResponse } from "next/server";

import { userCanAccessApp } from "@/lib/auth/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestLanguage, getTranslationForLanguage } from "@/src/i18n/server";

export async function requireRouteUser(request?: Request) {
  const { t } = getTranslationForLanguage(request ? getRequestLanguage(request) : null);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: t("api.unauthorized") }, { status: 401 }),
    };
  }

  const canAccessApp = await userCanAccessApp(supabase, user);
  if (!canAccessApp) {
    return {
      error: NextResponse.json({ error: "Acceso pendiente." }, { status: 403 }),
    };
  }

  return { user, supabase };
}
