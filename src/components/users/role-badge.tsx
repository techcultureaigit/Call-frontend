import { toTitleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";

const roleStyles: Record<UserRole, string> = {
  super_admin:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-500/20",
  admin:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/20",
  manager:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-500/20",
  sales_rep:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20",
  viewer:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        roleStyles[role],
        className
      )}
    >
      {toTitleCase(role)}
    </span>
  );
}
