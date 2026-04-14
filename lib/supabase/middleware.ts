import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/utils/env";
import type { Database } from "@/types/database";

function isInvalidRefreshToken(error: { message?: string; name?: string; status?: number } | null) {
  if (!error) return false;
  return error.status === 400 && /invalid refresh token|refresh token not found/i.test(error.message ?? "");
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))
    .forEach((cookie) => {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    });
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  const env = getPublicEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.getUser();

  if (isInvalidRefreshToken(error)) {
    clearSupabaseAuthCookies(request, response);
  }

  return response;
}
