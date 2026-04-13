import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LoginCard } from "@/components/trades/login-card";
import { getServerTranslation } from "@/src/i18n/server";

export const preferredRegion = "fra1";

export default async function LoginPage() {
  const { t } = await getServerTranslation();

  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(61,217,180,0.08),transparent_35%)]" />
      <div className="absolute end-6 top-6 z-10">
        <LanguageSwitcher />
      </div>
      <div className="relative grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="rtl-kicker text-xs font-semibold uppercase tracking-[0.26em] text-accent">{t("login.eyebrow")}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text md:text-6xl">
            {t("login.heroTitle")}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">{t("login.heroDescription")}</p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LoginCard />
        </div>
      </div>
    </main>
  );
}
