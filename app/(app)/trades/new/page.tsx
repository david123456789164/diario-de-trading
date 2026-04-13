import { TradeForm } from "@/components/trades/trade-form";
import { PageHeader } from "@/components/ui/page-header";
import { getServerTranslation } from "@/src/i18n/server";

export default async function NewTradePage() {
  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trades.new.title")}
        description={t("trades.new.description")}
      />
      <TradeForm mode="create" />
    </div>
  );
}
