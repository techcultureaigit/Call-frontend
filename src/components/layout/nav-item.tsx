"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isRouteActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarNavContent,
  sidebarIconClass,
  sidebarRowClass,
} from "./sidebar-styles";

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
  id,
  title,
  href,
  icon: Icon,
  badge,
  disabled,
  external,
  collapsed,
  pathname,
  siblingHrefs = [],
  nested = false,
  onNavigate,
}: NavItemProps) {
  const isActive = isRouteActive(pathname, href, siblingHrefs);

  const className = cn(
    sidebarRowClass(isActive, { collapsed, nested }),
    disabled && "pointer-events-none opacity-40"
  );

  const content =
    collapsed && !nested ? (
      <span className="flex size-5 items-center justify-center">
        <Icon
          className={sidebarIconClass(isActive)}
          strokeWidth={isActive ? 2.1 : 1.85}
          aria-hidden
        />
      </span>
    ) : (
      <>
        <SidebarNavContent
          icon={Icon}
          label={title}
          isActive={isActive}
        />
        {badge ? (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sidebar-muted ring-1 ring-sidebar-border">
            {badge}
          </span>
        ) : null}
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

  if (collapsed && !nested) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="border-sidebar-border bg-sidebar-elevated text-sm text-white shadow-lg"
        >
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
}
