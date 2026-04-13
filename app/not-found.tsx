import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServerTranslation } from "@/src/i18n/server";

export default async function NotFound() {
  const { t } = await getServerTranslation();

  return (
    <div className="page-shell flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">404</p>
        <h1 className="text-3xl font-semibold text-text">{t("notFound.title")}</h1>
        <p className="text-muted">{t("notFound.description")}</p>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button>{t("notFound.action")}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
