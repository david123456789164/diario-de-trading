import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="flex min-h-[260px] flex-col items-center justify-center gap-4 border-dashed text-center">
      <div className="rounded-3xl border border-stroke bg-background/60 p-4">
        <BarChart3 className="h-8 w-8 text-accent" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-text">{title}</h3>
        <p className="max-w-md text-sm text-muted">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-medium text-background transition hover:bg-accent/90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </Card>
  );
}
