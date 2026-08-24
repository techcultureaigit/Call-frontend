"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";

const typeConfig: Record<
  NotificationType,
  { label: string; className: string }
> = {
  info: {
    label: "Info",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  success: {
    label: "Success",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive",
  },
};

export function NotificationTypeBadge({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  const config = typeConfig[type];
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] font-medium uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export const notificationTypeDot: Record<NotificationType, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
};
