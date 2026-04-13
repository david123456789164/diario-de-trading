import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-lg border border-stroke bg-background/60 px-4 py-3 text-sm text-text placeholder:text-muted focus:border-accent/70",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
