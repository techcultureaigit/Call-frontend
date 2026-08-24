import { toTitleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border",
        className
      )}
    >
      {toTitleCase(role.replace(/[_-]+/g, " "))}
    </span>
  );
}
