"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MODULE_BADGE_STYLES } from "@/lib/constants/activity-logs";
import type { AuditModule } from "@/types/activity-log";

export function ActivityLogModuleBadge({
  module,
  className,
}: {
  module: AuditModule;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] font-medium capitalize",
        MODULE_BADGE_STYLES[module],
        className
      )}
    >
      {module}
    </Badge>
  );
}
