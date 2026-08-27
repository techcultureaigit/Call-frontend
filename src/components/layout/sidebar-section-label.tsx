"use client";

import { cn } from "@/lib/utils";

interface SidebarSectionLabelProps {
  label: string;
  className?: string;
}

export function SidebarSectionLabel({
  label,
  className,
}: SidebarSectionLabelProps) {
  return (
    <div className={cn("mb-1.5 px-2.5 pt-1.5", className)}>
      <p
        className={cn(
          "truncate text-[10px] font-semibold uppercase leading-none",
          "tracking-[0.16em] text-white/38"
        )}
      >
        {label}
      </p>
    </div>
  );
}
