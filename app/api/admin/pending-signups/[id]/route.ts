import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { requireAdminRoute } from "@/lib/auth/admin";
import { decryptPendingPassword } from "@/lib/auth/pending-password";

export const preferredRegion = "fra1";

const reviewSignupSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const { action } = reviewSignupSchema.parse(await request.json());

    const { data: signup, error: signupError } = await auth.adminSupabase
      .from("pending_signups")
      .select("id, name, email, password_encrypted, password_nonce, status")
      .eq("id", id)
      .maybeSingle();

    if (signupError || !signup) {
      return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    }

    if (signup.status !== "pending") {
      return NextResponse.json({ error: "La solicitud ya fue revisada." }, { status: 409 });
    }

    if (action === "reject") {
      const { error } = await auth.adminSupabase
        .from("pending_signups")
        .update({
          status: "rejected",
          password_encrypted: null,
          password_nonce: null,
        })
        .eq("id", signup.id);

      if (error) {
        return NextResponse.json({ error: "No se pudo rechazar la solicitud." }, { status: 400 });
      }

      revalidatePath("/admin");
      return NextResponse.json({ message: "Acceso rechazado." });
    }

    if (!signup.password_encrypted || !signup.password_nonce) {
      return NextResponse.json({ error: "La solicitud no tiene una contraseña válida." }, { status: 400 });
    }

    const password = decryptPendingPassword(signup.password_encrypted, signup.password_nonce);
    const createdUser = await auth.adminSupabase.auth.admin.createUser({
      email: signup.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: signup.name,
        name: signup.name,
      },
    });

    if (createdUser.error || !createdUser.data.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario aprobado." }, { status: 400 });
    }

    const approvedAt = new Date().toISOString();
    const { error: profileError } = await auth.adminSupabase.from("profiles").upsert(
      {
        id: createdUser.data.user.id,
        email: signup.email,
        full_name: signup.name,
        approved: true,
        approved_at: approvedAt,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json({ error: "El usuario fue creado, pero no se pudo aprobar el perfil." }, { status: 500 });
    }

    const { error: pendingError } = await auth.adminSupabase
      .from("pending_signups")
      .update({
        status: "approved",
        approved_at: approvedAt,
        approved_by: auth.user.id,
        password_encrypted: null,
        password_nonce: null,
      })
      .eq("id", signup.id);

    if (pendingError) {
      return NextResponse.json({ error: "El usuario fue creado, pero no se pudo cerrar la solicitud." }, { status: 500 });
    }

    revalidatePath("/admin");
    return NextResponse.json({ message: "Usuario aprobado." });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Acción inválida." }, { status: 422 });
    }

    return NextResponse.json({ error: "No se pudo revisar la solicitud." }, { status: 500 });
  }
}
