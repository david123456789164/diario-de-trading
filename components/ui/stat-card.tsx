import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: "positive" | "negative" | "neutral";
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        {trend === "positive" ? (
          <TrendingUp className="h-4 w-4 text-accent" />
        ) : trend === "negative" ? (
          <TrendingDown className="h-4 w-4 text-danger" />
        ) : null}
      </div>
      <div className="space-y-1">
        <p className={cn("text-2xl font-semibold text-text", trend === "negative" && "text-danger", trend === "positive" && "text-accent")}>
          {value}
        </p>
        {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
    </Card>
  );
}

