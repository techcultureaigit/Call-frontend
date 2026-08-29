"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  TOOLBAR_SEARCH_INPUT_CLASS,
} from "@/components/shared/toolbar-styles";
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
  /** Optional width/layout override for the search field wrapper */
  searchClassName?: string;
  /** Push filters + actions to the right on wide screens */
  alignControlsEnd?: boolean;
  /** Column visibility / reorder control (from DataTable). */
  columnsControl?: ReactNode;
  /** Embedded inside a table card — no outer border/shadow */
  variant?: "default" | "embedded";
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
  searchClassName,
  alignControlsEnd = false,
  columnsControl,
  variant = "default",
}: ListToolbarProps) {
  const embedded = variant === "embedded";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        embedded
          ? "shrink-0 border-b border-border/60 bg-card px-3 py-3 sm:px-4 sm:py-3.5"
          : "rounded-[6px] border border-border/60 bg-card p-3 shadow-card sm:p-3.5",
        className
      )}
    >
      <div
        className={cn(
          "relative min-w-0",
          searchClassName ?? "w-full flex-1"
        )}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          disabled={disabled}
          className={TOOLBAR_SEARCH_INPUT_CLASS}
        />
      </div>
      {filters || columnsControl || actions ? (
        <div
          className={cn(
            "flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2",
            alignControlsEnd && "sm:ml-auto"
          )}
        >
          {filters}
          {columnsControl}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
