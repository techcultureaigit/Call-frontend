"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isRouteActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface NavItemProps {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  external?: boolean;
  variant?: "default" | "cta";
  collapsed?: boolean;
  pathname: string;
  siblingHrefs?: string[];
  index?: number;
  nested?: boolean;
  onNavigate?: () => void;
}

export function NavItem({
  title,
  href,
  icon: Icon,
  badge,
  disabled,
  external,
  variant = "default",
  collapsed,
  pathname,
  siblingHrefs = [],
  index = 0,
  nested = false,
  onNavigate,
}: NavItemProps) {
  const isActive = isRouteActive(pathname, href, siblingHrefs);
  const isCta = variant === "cta";

  const className = cn(
    "group relative flex items-center gap-3 rounded-lg text-[13px] font-medium",
    "transition-all duration-200 ease-out",
    nested ? "px-3 py-2" : "px-3 py-2.5",
    collapsed && !nested && "justify-center px-2.5 py-2.5",
    disabled && "pointer-events-none opacity-40",
    isActive
      ? nested
        ? "bg-sidebar-active/80 text-sidebar-active-foreground"
        : "bg-sidebar-active text-sidebar-active-foreground shadow-[inset_0_0_0_1px_var(--sidebar-active-border)]"
      : isCta
        ? "border border-dashed border-sidebar-primary/30 text-sidebar-primary hover:border-sidebar-primary/50 hover:bg-sidebar-primary/5"
        : "text-sidebar-foreground/65 hover:bg-sidebar-hover hover:text-sidebar-foreground"
  );

  const content = (
    <>
      {isActive && !nested && (
        <motion.span
          layoutId={`sidebar-active-indicator-${href}`}
          className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sidebar-primary"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      {isActive && nested && (
        <motion.span
          layoutId={`sidebar-sub-active-${href}`}
          className="absolute left-2.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-sidebar-primary"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      <Icon
        className={cn(
          "shrink-0 transition-colors duration-200",
          nested ? "size-4" : "size-[18px]",
          isActive
            ? "text-sidebar-primary"
            : isCta
              ? "text-sidebar-primary/75 group-hover:text-sidebar-primary"
              : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80"
        )}
      />
      {(!collapsed || nested) && (
        <>
          <span className="flex-1 truncate tracking-[-0.01em]">{title}</span>
          {badge && (
            <span className="rounded-md bg-sidebar-primary/12 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sidebar-primary">
              {badge}
            </span>
          )}
        </>
      )}
    </>
  );

  const linkElement = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={title}
    >
      {content}
    </a>
  ) : (
    <Link
      href={href}
      onClick={onNavigate}
      className={className}
      aria-label={title}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </Link>
  );

  const animatedLink = (
    <motion.div
      custom={index}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {linkElement}
    </motion.div>
  );

  if (collapsed && !nested) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{animatedLink}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={14}
          className="border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return animatedLink;
}
