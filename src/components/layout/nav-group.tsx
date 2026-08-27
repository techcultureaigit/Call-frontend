"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavItemConfig } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isNavItemActive } from "@/lib/navigation";
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

/**
 * Nested module group — parent row navigates; chevron toggles children.
 */
export function NavGroup({
  item,
  collapsed,
  activeGroupIds,
  index,
  onNavigate,
}: NavGroupProps) {
  const pathname = usePathname();
  const expandedGroups = useSidebarStore((state) => state.expandedGroups);
  const setGroupExpanded = useSidebarStore((state) => state.setGroupExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = selectIsGroupExpanded(
    expandedGroups,
    item.id,
    activeGroupIds
  );
  const isActive = isNavItemActive(pathname, item);
  const children = item.children ?? [];
  const siblingHrefs = children.map((child) => child.href);
  const Icon = item.icon;

  const handleToggle = () => {
    setGroupExpanded(item.id, !isExpanded);
  };

  const categoryHighlight = isExpanded || isActive;

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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group/nav relative space-y-0.5">
        <div
          className={cn(
            "relative flex items-center rounded-[7px] transition-colors duration-200 ease-out",
            isActive
              ? "bg-white/12 text-sidebar-foreground ring-1 ring-inset ring-white/15"
              : categoryHighlight
                ? "bg-white/[0.07] text-sidebar-foreground"
                : isHovered
                  ? "bg-white/[0.05]"
                  : "bg-transparent"
          )}
        >
          <Link
            href={item.href}
            onClick={() => {
              if (!isExpanded) setGroupExpanded(item.id, true);
              onNavigate?.();
            }}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[13px] font-medium tracking-[-0.01em]",
              "transition-colors duration-200 text-sidebar-foreground/85",
              "hover:text-sidebar-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className="size-4 shrink-0 text-sidebar-foreground/75"
              strokeWidth={categoryHighlight ? 2.15 : 1.85}
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
          </Link>

          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggle}
                className={cn(
                  "relative z-10 mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md",
                  "text-sidebar-foreground/55 transition-colors duration-200",
                  "hover:bg-white/10 hover:text-sidebar-foreground"
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
    </div>
  );
}
