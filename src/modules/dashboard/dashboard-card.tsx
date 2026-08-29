import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  compact?: boolean;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  noPadding = false,
  compact = false,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-border/60 bg-card shadow-card",
        "transition-shadow duration-200 hover:shadow-elevated",
        className
      )}
    >
      <CardHeader
        className={cn(
          "grid grid-cols-1 gap-3 space-y-0 border-b border-border/50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4",
          compact ? "gap-2 p-3 pb-2" : "gap-3 pb-4"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-start",
            compact ? "gap-2" : "gap-3"
          )}
        >
          {Icon && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-[6px] bg-brand/10 text-brand",
                compact ? "size-7" : "size-9"
              )}
            >
              <Icon className={compact ? "size-3.5" : "size-[18px]"} />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <CardTitle
              className={cn(
                "tracking-tight",
                compact ? "text-[13px] leading-tight" : "text-[15px]"
              )}
            >
              {title}
            </CardTitle>
            {description && (
              <CardDescription
                className={compact ? "text-[10px] leading-snug" : "text-xs"}
              >
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
            {action}
          </div>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          compact ? "p-3 pt-2" : "pt-5",
          noPadding && "p-0 pt-0",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
