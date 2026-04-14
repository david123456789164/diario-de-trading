import Link from "next/link";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const preferredRegion = "fra1";

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rejected = status === "rejected";

  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(61,217,180,0.08),transparent_35%)]" />
      <div className="absolute end-6 top-6 z-10">
        <LanguageSwitcher />
      </div>

      <Card className="relative w-full max-w-xl space-y-5 border-accent/10 bg-panel/90 p-8 text-center">
        <p className="rtl-kicker text-xs font-semibold uppercase tracking-[0.26em] text-accent">
          {rejected ? "Acceso rechazado" : "Acceso pendiente"}
        </p>
        <div className="space-y-3">
          <CardTitle className="text-3xl md:text-4xl">
            {rejected ? "Tu solicitud fue rechazada." : "Solicitud enviada. Pendiente de aprobación."}
          </CardTitle>
          <CardDescription className="text-base">
            {rejected
              ? "Un admin revisó tu solicitud y no habilitó el acceso."
              : "Un admin debe aprobar manualmente tu cuenta antes de que puedas entrar."}
          </CardDescription>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-stroke bg-panel-soft px-4 text-sm font-medium text-text transition hover:border-accent/50 hover:text-accent"
        >
          Volver al login
        </Link>
      </Card>
    </main>
  );
}
