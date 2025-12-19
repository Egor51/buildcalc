"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-border/80 bg-card/80 text-foreground hover:border-primary/60 hover:bg-primary/5",
        outline:
          "border-border text-muted-foreground hover:text-foreground hover:border-primary/60",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        soft: "border-transparent bg-primary/10 text-primary",
      },
      size: {
        default: "text-sm",
        sm: "text-xs px-3 py-1",
        lg: "text-base px-5 py-2",
      },
      elevated: {
        true: "shadow-[0_6px_20px_rgba(17,19,27,0.08)]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        elevated: true,
        class: "bg-card/90",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      elevated: false,
    },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  asChild?: boolean;
  selected?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, elevated, asChild = false, selected, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-selected={selected}
        className={cn(
          chipVariants({ variant, size, elevated }),
          selected && "border-primary/80 bg-primary/15 text-primary",
          className,
        )}
        type={type}
        {...props}
      />
    );
  },
);

Chip.displayName = "Chip";
