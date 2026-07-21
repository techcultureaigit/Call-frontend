"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavItemConfig } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isNavItemActive, isRouteActive } from "@/lib/navigation";
import { useSidebarStore, selectIsGroupExpanded } from "@/stores";
import { cn } from "@/lib/utils";
import { NavSubItem } from "./nav-sub-item";
import { NavFlyout } from "./nav-flyout";

interface NavGroupProps {
  item: NavItemConfig;
  collapsed: boolean;
  activeGroupIds: string[];
  index: number;
  onNavigate?: () => void;
}

export function NavGroup({
  item,
  collapsed,
  activeGroupIds: _activeGroupIds,
  index,
  onNavigate,
}: NavGroupProps) {
  const pathname = usePathname();
  const expandedGroups = useSidebarStore((state) => state.expandedGroups);
  const toggleGroup = useSidebarStore((state) => state.toggleGroup);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = selectIsGroupExpanded(expandedGroups, item.id);
  const isActive = isNavItemActive(pathname, item);
  const children = item.children ?? [];
  const siblingHrefs = children.map((child) => child.href);
  const isSelfActive = isRouteActive(pathname, item.href, siblingHrefs);
  const Icon = item.icon;

  // Category row: light tint (never pure white)
  const categoryHighlight = isSelfActive || isExpanded || isActive;

  if (collapsed) {
    return (
      <NavFlyout
        item={item}
        isActive={isActive}
        onNavigate={onNavigate}
        index={index}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.22 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group/nav relative space-y-0.5">
        <div
          className={cn(
            "relative flex items-center rounded-[6px] transition-[background-color,box-shadow] duration-[280ms] ease-out",
            categoryHighlight
              ? "bg-[#f3f0f0]/14 text-sidebar-foreground"
              : isHovered
                ? "bg-sidebar-elevated"
                : "bg-transparent"
          )}
        >
          <button
            type="button"
            onClick={() => toggleGroup(item.id)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] font-medium tracking-[-0.01em]",
              "transition-colors duration-[280ms] text-sidebar-foreground"
            )}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
          >
            <Icon
              className="size-[18px] shrink-0 text-sidebar-foreground transition-transform duration-[280ms] group-hover/nav:translate-x-0.5"
              strokeWidth={categoryHighlight ? 2.25 : 2}
            />
            <span
              className={cn(
                "flex-1 truncate",
                categoryHighlight && "font-semibold"
              )}
            >
              {item.title}
            </span>
            {item.badge && (
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-foreground ring-1 ring-inset ring-white/15">
                {item.badge}
              </span>
            )}
          </button>

          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => toggleGroup(item.id)}
                className={cn(
                  "relative z-10 mr-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                  "text-sidebar-foreground transition-all duration-[280ms]",
                  "hover:bg-white/10"
                )}
                aria-label={
                  isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`
                }
                aria-expanded={isExpanded}
              >
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <ChevronRight className="size-3.5" />
                </motion.span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {isExpanded ? "Collapse" : "Expand"} {item.title}
            </TooltipContent>
          </Tooltip>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <ul className="space-y-0.5 pb-1 pt-0.5">
                {children.map((child) => (
                  <NavSubItem
                    key={child.id}
                    title={child.title}
                    href={child.href}
                    pathname={pathname}
                    siblingHrefs={siblingHrefs}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
