import { TradeForm } from "@/components/trades/trade-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewTradePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nuevo registro"
        title="Crear trade"
        description="Carga todos los datos relevantes de la operación para medir rendimiento, disciplina y calidad de ejecución."
      />
      <TradeForm mode="create" />
    </div>
  );
}

