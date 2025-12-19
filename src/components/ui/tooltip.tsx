"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: TooltipSide;
  className?: string;
  delay?: number;
}

export const Tooltip = ({
  content,
  children,
  side = "top",
  className,
  delay = 120,
}: TooltipProps) => {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
    transform: "translate(-50%, -100%)",
  });
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(frame);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const show = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);

  const hide = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const el = triggerRef.current;
    if (!el) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollX = window.scrollX ?? 0;
      const scrollY = window.scrollY ?? 0;
      const offset = 10;
      switch (side) {
        case "bottom":
          setPosition({
            top: rect.bottom + scrollY + offset,
            left: rect.left + scrollX + rect.width / 2,
            transform: "translate(-50%, 0)",
          });
          break;
        case "left":
          setPosition({
            top: rect.top + scrollY + rect.height / 2,
            left: rect.left + scrollX - offset,
            transform: "translate(-100%, -50%)",
          });
          break;
        case "right":
          setPosition({
            top: rect.top + scrollY + rect.height / 2,
            left: rect.right + scrollX + offset,
            transform: "translate(0, -50%)",
          });
          break;
        case "top":
        default:
          setPosition({
            top: rect.top + scrollY - offset,
            left: rect.left + scrollX + rect.width / 2,
            transform: "translate(-50%, -100%)",
          });
          break;
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, side]);

  const tooltipNode =
    mounted && open
      ? createPortal(
          <div
            role="tooltip"
            id={id}
            className={cn(
              "pointer-events-none fixed z-[9999] max-w-xs rounded-2xl border border-border/60 bg-foreground/95 px-3 py-2 text-xs font-medium text-background shadow-card-xl backdrop-blur-md animate-fade-up",
              className,
            )}
            style={position}
          >
            {content}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onTouchStart={show}
        onTouchEnd={hide}
        aria-describedby={id}
        className="inline-flex"
      >
        {children}
      </span>
      {tooltipNode}
    </>
  );
};
