"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Language / status / role filters — pass any selects */
  filters?: ReactNode;
  /** Export, Create, etc. */
  actions?: ReactNode;
  disabled?: boolean;
  className?: string;
  searchAriaLabel?: string;
}

/**
 * Shared list search + filters bar (DRY with DataTable / DataPagination).
 * Modules only pass filter controls + action buttons.
 */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  actions,
  disabled = false,
  className,
  searchAriaLabel = "Search",
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[6px] border border-border/50 bg-card/70 p-3 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:p-3.5",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          disabled={disabled}
          className="h-11 rounded-[6px] border-border/50 bg-background/80 pl-9 shadow-subtle"
        />
      </div>
      {filters}
      {actions}
    </div>
  );
}
