"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_ICON: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function AnalyticsCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  accent = "brand",
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: keyof typeof ACCENT_ICON;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[6px] border border-border/55 bg-card shadow-card",
        "transition-shadow duration-200 hover:shadow-elevated",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border/45 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-[6px]",
                ACCENT_ICON[accent] ?? ACCENT_ICON.brand
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2} />
            </div>
          ) : null}
          <div className="min-w-0 space-y-0.5">
            <h3 className="font-display truncate text-[15px] font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn("flex flex-1 flex-col px-4 pb-4 pt-3", contentClassName)}>
        {children}
      </div>
    </article>
  );
}

export function AnalyticsBadge({
  value,
  label,
  tone = "brand",
}: {
  value: ReactNode;
  label: string;
  tone?: "brand" | "emerald" | "violet" | "sky";
}) {
  const tones = {
    brand: "border-brand/25 bg-brand/8 text-brand",
    emerald:
      "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
    violet:
      "border-violet-500/25 bg-violet-500/8 text-violet-700 dark:text-violet-300",
    sky: "border-sky-500/25 bg-sky-500/8 text-sky-700 dark:text-sky-300",
  };

  return (
    <div className={cn("rounded-[6px] border px-2.5 py-1.5 text-right", tones[tone])}>
      <p className="font-display text-sm font-semibold tabular-nums leading-none">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}
