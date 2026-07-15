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

export function NavGroup({
  item,
  collapsed,
  activeGroupIds,
  index,
  onNavigate,
}: NavGroupProps) {
  const pathname = usePathname();
  const expandedGroups = useSidebarStore((state) => state.expandedGroups);
  const toggleGroup = useSidebarStore((state) => state.toggleGroup);
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
      <div
        className={cn(
          "group/nav relative rounded-lg transition-all duration-200",
          isActive && "bg-sidebar-active/40",
          isHovered && !isActive && "bg-sidebar-hover/50"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-sidebar-primary"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}

        <div className="flex items-center">
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-[-0.01em]",
              "transition-colors duration-200 hover:text-sidebar-foreground",
              isActive
                ? "text-sidebar-active-foreground"
                : "text-sidebar-foreground/65"
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors duration-200",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/45 group-hover/nav:text-sidebar-foreground/80"
              )}
            />
            <span className="flex-1 truncate text-left">{item.title}</span>
            {item.badge && (
              <span className="rounded-md bg-sidebar-primary/12 px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-primary">
                {item.badge}
              </span>
            )}
          </Link>

          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => toggleGroup(item.id)}
                className={cn(
                  "mr-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                  "text-sidebar-foreground/45 transition-all duration-200",
                  "hover:bg-sidebar-hover hover:text-sidebar-foreground",
                  isExpanded && "text-sidebar-foreground"
                )}
                aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
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
              <ul className="space-y-0.5 pb-2 pt-0.5">
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
