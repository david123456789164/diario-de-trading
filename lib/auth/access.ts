import type { User } from "@supabase/supabase-js";

import { isAdminEmail } from "@/lib/utils/server-env";

export async function userCanAccessApp(
  supabase: { from: (table: "profiles") => any },
  user: User | null,
) {
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;

  const { data } = await supabase
    .from("profiles")
    .select("approved")
    .eq("id", user.id)
    .maybeSingle();

  return data?.approved === true;
}
