"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-transparent text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_30px_rgba(111,91,255,0.3)] hover:-translate-y-0.5 hover:bg-secondary/90",
        outline:
          "border-border/70 bg-transparent text-foreground hover:border-primary hover:text-primary hover:bg-primary/5",
        ghost:
          "bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground",
        subtle:
          "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent",
        glass:
          "border-white/40 bg-white/20 text-foreground backdrop-blur-md hover:border-primary/40 hover:text-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_30px_rgba(255,77,77,0.35)] hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-2xl px-3 text-xs",
        lg: "h-12 rounded-3xl px-6 text-base",
        icon: "h-11 w-11",
        pill: "h-9 rounded-full px-5 text-xs tracking-wide uppercase",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };


