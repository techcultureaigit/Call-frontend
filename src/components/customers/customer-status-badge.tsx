import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/types/customer";

const statusStyles: Record<CustomerStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  lead: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  prospect: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  churned: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusLabels: Record<CustomerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
  prospect: "Prospect",
  churned: "Churned",
};

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className,
}: CustomerStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
