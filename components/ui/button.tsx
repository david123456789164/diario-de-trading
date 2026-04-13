import * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = {
  primary:
    "bg-accent text-background hover:bg-accent/90 disabled:bg-accent/50 disabled:text-background/70",
  secondary:
    "bg-panel-soft text-text hover:border-accent/50 hover:text-accent disabled:text-muted",
  ghost: "bg-transparent text-muted hover:bg-panel-soft hover:text-text",
  danger: "bg-danger/90 text-white hover:bg-danger disabled:bg-danger/60",
};

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed",
        buttonVariants[variant],
        variant === "secondary" && "border-stroke",
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
