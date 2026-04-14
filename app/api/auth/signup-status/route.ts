import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export const preferredRegion = "fra1";

const signupStatusSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export async function POST(request: Request) {
  const payload = signupStatusSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ status: "unknown" });
  }

  const adminSupabase = createServiceRoleSupabaseClient();
  const { data } = await adminSupabase
    .from("pending_signups")
    .select("status")
    .eq("email", payload.data.email)
    .maybeSingle();

  return NextResponse.json({ status: data?.status ?? "unknown" });
}
