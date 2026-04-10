import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">404</p>
        <h1 className="text-3xl font-semibold text-text">No encontramos lo que buscabas</h1>
        <p className="text-muted">La operación o página que intentaste abrir no existe o ya no está disponible.</p>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button>Volver al dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

