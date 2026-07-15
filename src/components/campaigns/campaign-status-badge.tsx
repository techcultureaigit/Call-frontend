import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types/campaign";

const statusStyles: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  stopped: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusLabels: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  stopped: "Stopped",
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
  pulse?: boolean;
}

export function CampaignStatusBadge({
  status,
  className,
  pulse,
}: CampaignStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
        statusStyles[status],
        className
      )}
    >
      {pulse && status === "active" && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {statusLabels[status]}
    </span>
  );
}
