"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  TOOLBAR_CONTROLS_CLASS,
  TOOLBAR_ROW_CLASS,
  TOOLBAR_SEARCH_INPUT_CLASS,
  TOOLBAR_SEARCH_WIDTH_CLASS,
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
  /**
   * Push filters + actions to the right (default true).
   * Search stays left; filters/actions share the same row.
   */
  alignControlsEnd?: boolean;
  /** Column visibility / reorder control (from DataTable). */
  columnsControl?: ReactNode;
  /** Embedded inside a table card — no outer border/shadow */
  variant?: "default" | "embedded";
}

/**
 * Shared list search + filters bar.
 * One row on desktop: search (left) · filters + actions (right).
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
  alignControlsEnd = true,
  columnsControl,
  variant = "default",
}: ListToolbarProps) {
  const embedded = variant === "embedded";
  const hasControls = Boolean(filters || columnsControl || actions);

  return (
    <div
      className={cn(
        "flex min-w-0",
        embedded
          ? "shrink-0 border-b border-border/60 bg-card px-2.5 py-2 md:px-3 md:py-2.5 xl:px-4 xl:py-3.5"
          : "rounded-[6px] border border-border/60 bg-card p-2.5 shadow-card md:p-3 xl:p-3.5",
        className
      )}
    >
      <div className={TOOLBAR_ROW_CLASS}>
        <div
          className={cn(
            "relative min-w-0",
            searchClassName ?? TOOLBAR_SEARCH_WIDTH_CLASS
          )}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            disabled={disabled}
            className={TOOLBAR_SEARCH_INPUT_CLASS}
          />
        </div>

        {hasControls ? (
          <div
            className={cn(
              TOOLBAR_CONTROLS_CLASS,
              !alignControlsEnd && "md:ml-0"
            )}
          >
            {filters}
            {columnsControl}
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
