import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  illustrationSrc,
  illustrationAlt,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
}) {
  return (
    <Card
      className={cn(
        "min-h-[260px] gap-6 border-dashed text-center",
        illustrationSrc
          ? "grid lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.8fr)] lg:items-center lg:text-start"
          : "flex flex-col items-center justify-center",
      )}
    >
      <div className={cn("flex flex-col items-center justify-center gap-4", illustrationSrc && "lg:items-start")}>
        <div className="rounded-lg border border-stroke bg-background/60 p-4">
          <BarChart3 className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <p className="max-w-md text-sm text-muted">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-background transition hover:bg-accent/90"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {illustrationSrc ? (
        <div className="overflow-hidden rounded-lg border border-stroke/70 bg-background/45 p-3">
          <img
            src={illustrationSrc}
            alt={illustrationAlt ?? title}
            className="mx-auto h-auto w-full max-w-[520px]"
          />
        </div>
      ) : null}
    </Card>
  );
}
