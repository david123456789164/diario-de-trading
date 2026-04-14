import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/utils/env";
import { getServerEnv } from "@/lib/utils/server-env";
import type { Database } from "@/types/database";

let serviceRoleClient: ReturnType<typeof createClient<Database>> | null = null;

export function createServiceRoleSupabaseClient() {
  if (!serviceRoleClient) {
    const publicEnv = getPublicEnv();
    const serverEnv = getServerEnv();

    serviceRoleClient = createClient<Database>(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return serviceRoleClient;
}
