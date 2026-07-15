import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  gradient?: string;
  noPadding?: boolean;
}

export function AnalyticsCard({
  title,
  description,
  action,
  children,
  className,
  gradient,
  noPadding = false,
}: AnalyticsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-card backdrop-blur-sm transition-shadow hover:shadow-elevated",
        className
      )}
    >
      {gradient && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
            gradient
          )}
        />
      )}
      <div className="relative border-b border-border/40 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      </div>
      <div className={cn("relative", noPadding ? "" : "p-5")}>{children}</div>
    </div>
  );
}
