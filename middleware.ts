import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/pending",
    "/dashboard/:path*",
    "/trades/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
