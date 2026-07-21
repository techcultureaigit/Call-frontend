"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItemConfig } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isRouteActive } from "@/lib/navigation";
import { LAYOUT } from "./constants";

interface NavFlyoutProps {
  item: NavItemConfig;
  isActive: boolean;
  onNavigate?: () => void;
  index: number;
}

interface FlyoutPosition {
  top: number;
  left: number;
}

export function NavFlyout({
  item,
  isActive,
  onNavigate,
  index,
}: NavFlyoutProps) {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<FlyoutPosition>({ top: 0, left: 0 });

  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const siblingHrefs = children.map((child) => child.href);
  const Icon = item.icon;

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const openFlyout = () => {
    if (!hasChildren) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePosition();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  const trigger = (
    <Link
      ref={triggerRef}
      href={item.href}
      className={cn(
        "group relative flex items-center justify-center rounded-[6px] px-2.5 py-2.5",
        "transition-[background-color,box-shadow] duration-[280ms] ease-out",
        isActive
          ? "text-neutral-900 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.45)]"
          : "text-sidebar-foreground hover:bg-sidebar-elevated",
        isOpen && !isActive && "bg-sidebar-elevated"
      )}
      aria-label={item.title}
      aria-expanded={hasChildren ? isOpen : undefined}
      onClick={(event) => {
        if (hasChildren) {
          event.preventDefault();
          if (isOpen) setIsOpen(false);
          else openFlyout();
        }
      }}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-[6px] bg-white" />
      )}
      <Icon
        className={cn(
          "relative size-[18px] transition-colors duration-[280ms]",
          isActive ? "text-neutral-900" : "text-sidebar-foreground"
        )}
        strokeWidth={isActive ? 2.25 : 2}
      />
    </Link>
  );

  const flyoutPanel =
    mounted &&
    createPortal(
      <AnimatePresence>
        {isOpen && hasChildren && (
          <>
            {/* Blur main content behind popup (keep sidebar clear) */}
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-y-0 right-0 z-[70] bg-background/25 backdrop-blur-[6px]"
              style={{ left: LAYOUT.sidebar.collapsed }}
              onClick={() => setIsOpen(false)}
              onMouseEnter={scheduleClose}
            />

            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed z-[80] w-[280px] -translate-y-1/2"
              style={{ top: position.top, left: position.left }}
              onMouseEnter={openFlyout}
              onMouseLeave={scheduleClose}
            >
              <span
                aria-hidden
                className="absolute -left-1.5 top-1/2 size-3 -translate-y-1/2 rotate-45 rounded-[2px] bg-white shadow-[-2px_2px_6px_-2px_rgb(0_0_0/0.12)]"
              />

              <div className="relative overflow-hidden rounded-[10px] border border-border/70 bg-white shadow-[0_20px_50px_-16px_rgb(15_23_42/0.35)]">
                <div className="border-b border-border/60 px-4 pb-3.5 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="nav-active-gradient flex size-9 shrink-0 items-center justify-center rounded-lg shadow-brand">
                      <Icon className="size-4 text-white" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] font-semibold tracking-tight text-brand">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                        {item.description ??
                          `Browse ${item.title.toLowerCase()} options`}
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="max-h-[min(420px,70vh)] space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
                  {children.map((child) => {
                    const isChildActive = isRouteActive(
                      pathname,
                      child.href,
                      siblingHrefs
                    );
                    const ChildIcon = child.icon;

                    return (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate?.();
                          }}
                          className={cn(
                            "group/item flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200",
                            isChildActive
                              ? "bg-brand/8 ring-1 ring-inset ring-brand/15"
                              : "hover:bg-muted/70"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
                              isChildActive
                                ? "bg-brand/15 text-brand"
                                : "bg-muted text-muted-foreground group-hover/item:text-foreground"
                            )}
                          >
                            <ChildIcon className="size-3.5" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "truncate text-[13px] font-semibold tracking-tight",
                                  isChildActive
                                    ? "text-brand"
                                    : "text-foreground"
                                )}
                              >
                                {child.title}
                              </span>
                              {child.badge && (
                                <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand">
                                  {child.badge}
                                </span>
                              )}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                                {child.description}
                              </span>
                            )}
                          </span>
                          <ChevronRight
                            className={cn(
                              "mt-1 size-3.5 shrink-0 transition-transform duration-200",
                              isChildActive
                                ? "text-brand"
                                : "text-muted-foreground/40 group-hover/item:translate-x-0.5 group-hover/item:text-muted-foreground"
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.22 }}
      className="relative"
      onMouseEnter={openFlyout}
      onMouseLeave={scheduleClose}
    >
      {hasChildren ? (
        trigger
      ) : (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={14}
            className="border-sidebar-border bg-sidebar text-sidebar-foreground"
          >
            {item.title}
          </TooltipContent>
        </Tooltip>
      )}
      {flyoutPanel}
    </motion.div>
  );
}
