"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/modules/dashboard/dashboard-card";

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
}: {
  value: ReactNode;
  label: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[6px] border border-brand/15 bg-brand/6 px-2.5 py-1.5 text-right">
      <p className="text-sm font-semibold tabular-nums leading-none text-brand">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
