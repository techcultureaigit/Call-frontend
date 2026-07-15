"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ACTION_BADGE_STYLES } from "@/lib/constants/activity-logs";
import type { AuditAction } from "@/types/activity-log";

export function ActivityLogActionBadge({
  action,
  className,
}: {
  action: AuditAction;
  className?: string;
}) {
  const label = action.replace(/_/g, " ");
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] font-medium capitalize",
        ACTION_BADGE_STYLES[action],
        className
      )}
    >
      {label}
    </Badge>
  );
}
