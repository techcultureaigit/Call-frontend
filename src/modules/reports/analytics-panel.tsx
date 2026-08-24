"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnalyticsShell({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[8px] border border-border/40 bg-card/50 shadow-subtle",
        className
      )}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent" />
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/25 px-3 py-1.5">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="truncate text-[10px] text-muted-foreground/75">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-2", bodyClassName)}>{children}</div>
    </section>
  );
}

export function AnalyticsTile({
  label,
  hint,
  action,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[6px] bg-background/40 p-2 ring-1 ring-inset ring-border/25",
        className
      )}
    >
      {(label || action) && (
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {label ? (
              <p className="text-[11px] font-medium leading-tight text-foreground">
                {label}
              </p>
            ) : null}
            {hint ? (
              <p className="text-[9px] leading-snug text-muted-foreground">
                {hint}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function AnalyticsStat({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[4px] bg-muted/30 px-1.5 py-0.5 text-right ring-1 ring-inset ring-border/20",
        className
      )}
    >
      <p className="text-[11px] font-semibold tabular-nums leading-none text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
