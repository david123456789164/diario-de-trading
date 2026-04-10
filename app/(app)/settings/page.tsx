import { SeedDemoButton } from "@/components/trades/seed-demo-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileForCurrentUser, getTradesForCurrentUser } from "@/lib/trading/queries";
import { formatDateTime, formatNumber } from "@/lib/utils/format";

export default async function SettingsPage() {
  const [{ user }, profile, trades] = await Promise.all([requireUser(), getProfileForCurrentUser(), getTradesForCurrentUser()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Ajustes y utilidades"
        description="Información básica de tu cuenta, carga de datos demo y recordatorios de seguridad."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text">Cuenta</h2>
            <p className="text-sm text-muted">Perfil básico asociado al usuario autenticado en Supabase.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">Email</p>
              <p className="mt-2 font-medium text-text">{user.email}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">Trades cargados</p>
              <p className="mt-2 font-medium text-text">{formatNumber(trades.length, 0)}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">Moneda preferida</p>
              <p className="mt-2 font-medium text-text">{profile?.preferred_currency ?? "USD"}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">Perfil creado</p>
              <p className="mt-2 font-medium text-text">{formatDateTime(profile?.created_at)}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text">Datos de ejemplo</h2>
            <p className="text-sm text-muted">
              Si quieres ver el dashboard lleno sin cargar trades manualmente, puedes insertar un set demo seguro para tu usuario.
            </p>
          </div>
          <SeedDemoButton />
          <div className="rounded-3xl border border-stroke bg-background/40 p-4 text-sm text-muted">
            La carga demo usa una función SQL que inserta datos solo para el usuario autenticado. No toca datos de otros usuarios.
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-text">Notas de seguridad</h2>
        <ul className="space-y-2 text-sm text-muted">
          <li>La app usa RLS para que cada usuario vea solo sus trades, notas e imágenes.</li>
          <li>En el frontend solo se usa la anon key pública de Supabase.</li>
          <li>La service role key no se usa ni se debe copiar en Vercel como variable pública.</li>
        </ul>
      </Card>
    </div>
  );
}

