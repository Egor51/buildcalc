import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/90 text-primary-foreground shadow-glow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border/60 text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        glow: "border-transparent bg-primary/15 text-primary",
        brand: "border-primary/30 bg-primary/10 text-primary",
        electric: "border-secondary/30 bg-secondary/15 text-secondary-foreground",
        glass: "border-white/40 bg-white/10 text-foreground backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };


