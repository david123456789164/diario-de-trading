import { redirect } from "next/navigation";

import { userCanAccessApp } from "@/lib/auth/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase };
}

export async function requireUser() {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    redirect("/login");
  }

  const canAccessApp = await userCanAccessApp(supabase, user);
  if (!canAccessApp) {
    await supabase.auth.signOut();
    redirect("/pending?status=pending");
  }

  return { user, supabase };
}
