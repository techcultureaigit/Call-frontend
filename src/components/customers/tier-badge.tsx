import { cn } from "@/lib/utils";
import type { CustomerTier } from "@/types/customer";

const tierStyles: Record<CustomerTier, string> = {
  enterprise: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  mid_market: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  smb: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  startup: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
};

const tierLabels: Record<CustomerTier, string> = {
  enterprise: "Enterprise",
  mid_market: "Mid Market",
  smb: "SMB",
  startup: "Startup",
};

interface TierBadgeProps {
  tier: CustomerTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        tierStyles[tier],
        className
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}
