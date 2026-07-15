import { cn } from "@/lib/utils";
import type { ResponseStatus } from "@/types/response";

const styles: Record<ResponseStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending_review: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  flagged: "bg-red-500/10 text-red-700 dark:text-red-400",
  rejected: "bg-muted text-muted-foreground",
  partial: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

const labels: Record<ResponseStatus, string> = {
  completed: "Completed",
  pending_review: "Pending Review",
  flagged: "Flagged",
  rejected: "Rejected",
  partial: "Partial",
};

export function ResponseStatusBadge({
  status,
  className,
}: {
  status: ResponseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
