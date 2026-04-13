import { SeedDemoButton } from "@/components/trades/seed-demo-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileForCurrentUser, getTradesForCurrentUser } from "@/lib/trading/queries";
import { formatDateTime, formatNumber } from "@/lib/utils/format";
import { getServerTranslation } from "@/src/i18n/server";

export default async function SettingsPage() {
  const { t, locale } = await getServerTranslation();
  const [{ user }, profile, trades] = await Promise.all([requireUser(), getProfileForCurrentUser(), getTradesForCurrentUser()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text">{t("settings.accountTitle")}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">{t("settings.email")}</p>
              <p className="mt-2 font-medium text-text">{user.email}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">{t("settings.loadedTrades")}</p>
              <p className="mt-2 font-medium text-text">{formatNumber(trades.length, 0, locale)}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">{t("settings.preferredCurrency")}</p>
              <p className="mt-2 font-medium text-text">{profile?.preferred_currency ?? "USD"}</p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-sm text-muted">{t("settings.profileCreated")}</p>
              <p className="mt-2 font-medium text-text">{formatDateTime(profile?.created_at, "—", locale)}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text">{t("settings.demoTitle")}</h2>
            <p className="text-sm text-muted">{t("settings.demoDescription")}</p>
          </div>
          <SeedDemoButton />
        </Card>
      </div>
    </div>
  );
}
