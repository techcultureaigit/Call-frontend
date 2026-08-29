"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { DashboardCard } from "@/modules/dashboard/dashboard-card";
import { cn } from "@/lib/utils";

export function AnalyticsCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
  compact,
  noPadding,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
  noPadding?: boolean;
}) {
  return (
    <DashboardCard
      title={title}
      description={description}
      icon={icon}
      action={action}
      className={className}
      contentClassName={contentClassName}
      compact={compact}
      noPadding={noPadding}
    >
      {children}
    </DashboardCard>
  );
}

export function AnalyticsBadge({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-[4.25rem] flex-col items-center justify-center rounded-[6px] border border-border/50 bg-muted/25 px-3 py-2 text-center",
        className
      )}
    >
      <p className="text-base font-semibold tabular-nums leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium leading-none text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function AnalyticsCardActions({
  badges,
  onViewAll,
  viewAllLabel = "View all",
}: {
  badges: { value: ReactNode; label: string }[];
  onViewAll?: () => void;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-stretch justify-end gap-2">
      {badges.map((badge) => (
        <AnalyticsBadge key={badge.label} value={badge.value} label={badge.label} />
      ))}
      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 self-stretch rounded-[6px] border border-border/60 bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[#2c3b59]/25 hover:text-[#2c3b59]"
        >
          {viewAllLabel}
          <ExternalLink className="size-3 shrink-0" />
        </button>
      ) : null}
    </div>
  );
}
