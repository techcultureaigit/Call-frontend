"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItemConfig } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isRouteActive } from "@/lib/navigation";

interface NavFlyoutProps {
  item: NavItemConfig;
  isActive: boolean;
  onNavigate?: () => void;
  index: number;
}

export function NavFlyout({
  item,
  isActive,
  onNavigate,
  index,
}: NavFlyoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const children = item.children ?? [];
  const siblingHrefs = children.map((child) => child.href);
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.22 }}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "group relative flex items-center justify-center rounded-[14px] px-2.5 py-2.5",
              "transition-[background-color,box-shadow] duration-[280ms] ease-out",
              isActive
                ? "text-sidebar-active-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--sidebar-primary)_22%,transparent)]"
                : "text-sidebar-foreground/60 hover:bg-sidebar-elevated"
            )}
            aria-label={item.title}
          >
            {isActive && (
              <span
                className="absolute inset-0 rounded-[14px]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklch, var(--sidebar-primary) 20%, transparent) 0%, transparent 75%)",
                }}
              />
            )}
            {isActive && (
              <motion.span
                layoutId="sidebar-active-indicator"
                className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sidebar-primary shadow-[0_0_10px_1px_var(--sidebar-primary)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <Icon
              className={cn(
                "relative size-[18px] transition-colors duration-[280ms]",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/90"
              )}
              strokeWidth={isActive ? 2.25 : 2}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={14}
          className="border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          {item.title}
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 z-50 ml-3 min-w-[210px] rounded-2xl border border-sidebar-border/60 bg-sidebar-elevated/95 p-2 shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)] backdrop-blur-xl"
          >
            <p className="mb-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
              {item.title}
            </p>
            <ul className="space-y-0.5">
              {children.map((child) => {
                const isChildActive = isRouteActive(
                  pathname,
                  child.href,
                  siblingHrefs
                );

                return (
                  <li key={child.id}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-xl px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-[280ms]",
                        "hover:bg-sidebar-hover hover:text-sidebar-foreground",
                        isChildActive
                          ? "bg-sidebar-primary/12 text-sidebar-active-foreground ring-1 ring-inset ring-sidebar-primary/20"
                          : "text-sidebar-foreground/65"
                      )}
                    >
                      {child.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
