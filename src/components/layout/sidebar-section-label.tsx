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
    <div className={cn("mb-2.5 px-3 pt-2", className)}>
      <div className="group/section flex items-center gap-2.5">
        {/* Brand rail */}
        <span
          aria-hidden
          className={cn(
            "relative h-4 w-[3px] shrink-0 overflow-hidden rounded-full",
            "bg-gradient-to-b from-brand via-brand to-brand-blue",
            "shadow-[0_0_12px_color-mix(in_oklch,var(--brand)_45%,transparent)]"
          )}
        />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-display text-[11px] font-bold uppercase leading-none",
              "tracking-[0.2em]",
              "text-transparent bg-clip-text",
              "bg-gradient-to-r from-white/80 via-white/65 to-white/35"
            )}
          >
            {label}
          </p>
          <span
            aria-hidden
            className={cn(
              "mt-1.5 block h-px w-full max-w-[7.5rem]",
              "bg-gradient-to-r from-brand/50 via-brand-blue/25 to-transparent"
            )}
          />
        </div>
      </div>
    </div>
  );
}
