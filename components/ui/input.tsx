import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-stroke bg-background/60 px-4 text-sm text-text placeholder:text-muted focus:border-accent/70",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

