import Link from "next/link";

import { PendingSignupsTable } from "@/components/admin/pending-signups-table";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export default async function AdminPage() {
  const { adminSupabase, user } = await requireAdminPage();
  const { data, error } = await adminSupabase
    .from("pending_signups")
    .select("id, name, email, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las solicitudes pendientes.");
  }

  return (
    <main className="page-shell min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="rtl-kicker text-xs font-semibold uppercase tracking-[0.26em] text-accent">
              Panel admin
            </p>
            <h1 className="text-4xl font-semibold text-text">Solicitudes pendientes</h1>
            <p className="max-w-2xl text-sm text-muted">
              Sesión admin: {user.email}. Aprobar crea el usuario en Supabase Auth con email confirmado.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-stroke bg-panel-soft px-4 text-sm font-medium text-text transition hover:border-accent/50 hover:text-accent"
          >
            Ir al dashboard
          </Link>
        </div>

        <Card className="space-y-5">
          <div className="space-y-1">
            <CardTitle>Revisión manual</CardTitle>
            <CardDescription>
              Solo usuarios aprobados por admin podrán iniciar sesión con email y contraseña.
            </CardDescription>
          </div>
          <PendingSignupsTable signups={data ?? []} />
        </Card>
      </div>
    </main>
  );
}
