"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PendingSignup = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  return typeof body?.error === "string" ? body.error : "No se pudo revisar la solicitud.";
}

export function PendingSignupsTable({ signups }: { signups: PendingSignup[] }) {
  const [rows, setRows] = useState(signups);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function reviewSignup(id: string, action: "approve" | "reject") {
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/pending-signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        toast.error(await readError(response));
        return;
      }

      setRows((current) => current.filter((row) => row.id !== id));
      toast.success(action === "approve" ? "Usuario aprobado." : "Acceso rechazado.");
    } catch {
      toast.error("No se pudo revisar la solicitud.");
    } finally {
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="subtle-panel p-5">
        <p className="font-medium text-text">No hay solicitudes pendientes.</p>
        <p className="mt-1 text-sm text-muted">Cuando alguien se registre, aparecerá acá para revisión manual.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stroke">
      <div className="hidden grid-cols-[1fr_1fr_180px_220px] gap-4 border-b border-stroke bg-background/50 px-4 py-3 text-sm font-semibold text-muted md:grid">
        <span>Nombre</span>
        <span>Email</span>
        <span>Solicitud</span>
        <span>Acciones</span>
      </div>

      {rows.map((row) => {
        const busy = pendingId === row.id;

        return (
          <div
            key={row.id}
            className="grid gap-3 border-b border-stroke px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_180px_220px] md:gap-4"
          >
            <span className="min-w-0 break-words font-medium text-text">{row.name}</span>
            <span className="min-w-0 break-words text-muted">{row.email}</span>
            <span className="text-muted">{new Date(row.created_at).toLocaleString()}</span>
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => reviewSignup(row.id, "approve")}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Aprobar
              </Button>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => reviewSignup(row.id, "reject")}>
                Rechazar
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
