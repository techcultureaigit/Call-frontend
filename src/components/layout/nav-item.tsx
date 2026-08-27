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
    "group relative flex items-center gap-2.5 rounded-[7px] text-[13px] font-medium",
    "transition-[background-color,color,box-shadow] duration-200 ease-out",
    nested ? "px-2.5 py-1.5" : "px-2.5 py-2",
    collapsed && !nested && "justify-center px-2 py-2",
    disabled && "pointer-events-none opacity-40",
    isActive
      ? "bg-white text-neutral-900 shadow-[0_4px_14px_-6px_rgb(0_0_0/0.4)]"
      : isCta
        ? "border border-dashed border-sidebar-primary/30 text-sidebar-primary hover:border-sidebar-primary/50 hover:bg-sidebar-primary/5"
        : "text-sidebar-foreground/80 hover:bg-white/[0.06] hover:text-sidebar-foreground"
  );

  const content = (
    <>
      {isActive && !nested && (
        <motion.span
          layoutId="sidebar-active-bg"
          className="pointer-events-none absolute inset-0 rounded-[7px] bg-white"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
        />
      )}
      <Icon
        className={cn(
          "relative size-4 shrink-0 transition-colors duration-200 ease-out",
          isActive
            ? "text-neutral-900"
            : isCta
              ? "text-sidebar-primary/75 group-hover:text-sidebar-primary"
              : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
        )}
        strokeWidth={isActive ? 2.2 : 1.85}
      />
      {(!collapsed || nested) && (
        <>
          <span
            className={cn(
              "relative flex-1 truncate tracking-[-0.01em]",
              isActive && "font-semibold text-neutral-900"
            )}
          >
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                "relative rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset",
                isActive
                  ? "bg-neutral-900/8 text-neutral-900 ring-neutral-900/15"
                  : "bg-sidebar-primary/15 text-sidebar-primary ring-sidebar-primary/20"
              )}
            >
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

  const animatedLink = linkElement;

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
