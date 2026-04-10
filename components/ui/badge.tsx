import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-panel-soft text-muted",
        tone === "positive" && "bg-accent/15 text-accent",
        tone === "negative" && "bg-danger/15 text-danger",
        tone === "warning" && "bg-warning/15 text-warning",
        tone === "info" && "bg-info/15 text-info",
      )}
    >
      {children}
    </span>
  );
}

