"use client";

import { cn } from "@/lib/utils";

interface SidebarSectionLabelProps {
  label: string;
  className?: string;
}

/** Section grouping — small label + spacing, no divider lines */
export function SidebarSectionLabel({
  label,
  className,
}: SidebarSectionLabelProps) {
  return (
    <div className={cn("mb-2 mt-6 px-3 first:mt-2", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8b96a8]">
        {label}
      </p>
    </div>
  );
}
