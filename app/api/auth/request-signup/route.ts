import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { encryptPendingPassword } from "@/lib/auth/pending-password";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export const preferredRegion = "fra1";

const requestSignupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(128),
});

export async function POST(request: Request) {
  try {
    const payload = requestSignupSchema.parse(await request.json());
    const adminSupabase = createServiceRoleSupabaseClient();

    const { data: existing, error: existingError } = await adminSupabase
      .from("pending_signups")
      .select("id, status")
      .eq("email", payload.email)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "No se pudo revisar la solicitud." }, { status: 500 });
    }

    if (existing?.status === "pending") {
      return NextResponse.json(
        { code: "pending", error: "Solicitud enviada. Pendiente de aprobación." },
        { status: 409 },
      );
    }

    if (existing?.status === "rejected") {
      return NextResponse.json({ code: "rejected", error: "Acceso rechazado." }, { status: 403 });
    }

    if (existing?.status === "approved") {
      return NextResponse.json(
        { code: "approved", error: "La cuenta ya fue aprobada. Iniciá sesión." },
        { status: 409 },
      );
    }

    const { passwordEncrypted, passwordNonce } = encryptPendingPassword(payload.password);

    const { error } = await adminSupabase.from("pending_signups").insert({
      name: payload.name,
      email: payload.email,
      password_encrypted: passwordEncrypted,
      password_nonce: passwordNonce,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: "No se pudo enviar la solicitud." }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Solicitud enviada. Pendiente de aprobación." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Revisá nombre, email y contraseña.",
          fieldErrors: error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ error: "No se pudo enviar la solicitud." }, { status: 500 });
  }
}
