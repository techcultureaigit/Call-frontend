import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/user";

const statusStyles: Record<UserStatus, string> = {
  active:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  invited: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  suspended: "bg-red-500/10 text-red-700 dark:text-red-400",
};

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
