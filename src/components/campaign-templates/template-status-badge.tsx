"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TemplateStatus } from "@/types/campaign-template";

const STATUS_STYLES: Record<
  TemplateStatus,
  { label: string; className: string; dot?: boolean }
> = {
  active: {
    label: "Active",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: true,
  },
  draft: {
    label: "Draft",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  archived: {
    label: "Archived",
    className: "border-border bg-muted/60 text-muted-foreground",
  },
};

export function TemplateStatusBadge({
  status,
  className,
}: {
  status: TemplateStatus;
  className?: string;
}) {
  const config = STATUS_STYLES[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.dot && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {config.label}
    </Badge>
  );
}
