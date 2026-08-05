import { cn } from "@/lib/utils";
import type { CallStatus } from "@/types/call";

const statusStyles: Record<CallStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  queued: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  no_answer: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  busy: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels: Record<CallStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  queued: "Queued",
  failed: "Failed",
  no_answer: "No Answer",
  busy: "Busy",
  cancelled: "Cancelled",
};

interface CallStatusBadgeProps {
  status: CallStatus;
  pulse?: boolean;
  className?: string;
}

export function CallStatusBadge({
  status,
  pulse,
  className,
}: CallStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
        statusStyles[status],
        className
      )}
    >
      {pulse && ["in_progress", "queued"].includes(status) && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {statusLabels[status]}
    </span>
  );
}
