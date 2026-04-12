import { LoginCard } from "@/components/trades/login-card";

export const preferredRegion = "fra1";

export default function LoginPage() {
  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(61,217,180,0.08),transparent_35%)]" />
      <div className="relative grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">Dashboard privado</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text md:text-6xl">
            Un diario de trading serio para medir tu proceso, no solo el resultado.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
            Guarda entradas, salidas, riesgo, screenshots y aprendizajes. Después conviértelos en métricas claras
            para detectar qué setups realmente funcionan en swing trading.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LoginCard />
        </div>
      </div>
    </main>
  );
}
