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
              "group relative flex items-center justify-center rounded-lg px-2.5 py-2.5",
              "transition-all duration-200 ease-out",
              "hover:bg-sidebar-hover",
              isActive
                ? "bg-sidebar-active text-sidebar-active-foreground shadow-[inset_0_0_0_1px_var(--sidebar-active-border)]"
                : "text-sidebar-foreground/65"
            )}
            aria-label={item.title}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active-indicator"
                className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sidebar-primary"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Icon
              className={cn(
                "size-[18px] transition-colors duration-200",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80"
              )}
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
            className="absolute left-full top-0 z-50 ml-2 min-w-[200px] rounded-lg border border-sidebar-border bg-sidebar p-2 shadow-elevated"
          >
            <p className="mb-1 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
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
                        "block rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-200",
                        "hover:bg-sidebar-hover hover:text-sidebar-foreground",
                        isChildActive
                          ? "bg-sidebar-active text-sidebar-active-foreground"
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
