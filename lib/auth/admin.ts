import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/utils/server-env";

export async function requireAdminPage() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return {
    user,
    adminSupabase: createServiceRoleSupabaseClient(),
  };
}

export async function requireAdminRoute() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "No autorizado." }, { status: 401 }),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      error: NextResponse.json({ error: "Solo un admin puede hacer esta acción." }, { status: 403 }),
    };
  }

  return {
    user,
    adminSupabase: createServiceRoleSupabaseClient(),
  };
}
