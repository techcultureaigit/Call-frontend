"use client";

import type { ReactNode } from "react";
import { DataPagination } from "@/components/shared/data-pagination";
import { ListTableCard } from "@/components/shared/list-table-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { cn } from "@/lib/utils";
import type { PaginatedMeta } from "@/types";

export interface PaginatedListShellProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  searchClassName?: string;
  alignControlsEnd?: boolean;
  columnsControl?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  toolbarDisabled?: boolean;
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  /** Passes selected rows-per-page limit to the list fetch. */
  onLimitChange?: (limit: number) => void;
  limitOptions?: readonly number[];
  itemLabel?: string;
  children: ReactNode;
  /** Full-height layout with toolbar + table as separate cards */
  unified?: boolean;
  /**
   * Lock table area to remaining viewport and scroll inside (for large page sizes).
   * Default false — table grows with rows; page scrolls if needed.
   */
  constrainHeight?: boolean;
}

/** Shared list layout: search bar + content + pagination (DRY for survey list & response). */
export function PaginatedListShell({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchAriaLabel = "Search",
  searchClassName,
  alignControlsEnd,
  columnsControl,
  filters,
  actions,
  toolbarDisabled,
  meta,
  onPageChange,
  onLimitChange,
  limitOptions,
  itemLabel = "items",
  children,
  unified = false,
  constrainHeight = false,
}: PaginatedListShellProps) {
  const toolbar = (
    <ListToolbar
      className="shrink-0"
      variant="default"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      searchAriaLabel={searchAriaLabel}
      searchClassName={searchClassName}
      alignControlsEnd={alignControlsEnd}
      columnsControl={columnsControl}
      filters={filters}
      actions={actions}
      disabled={toolbarDisabled}
    />
  );

  const pagination = (
    <DataPagination
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      limitOptions={limitOptions}
      itemLabel={itemLabel}
      variant="inline"
      className="shrink-0"
    />
  );

  if (unified) {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-col gap-4",
          constrainHeight && "min-h-0 flex-1 overflow-hidden"
        )}
      >
        <ListTableCard
          className={cn(
            "flex flex-col",
            constrainHeight && "min-h-0 flex-1"
          )}
        >
          <ListToolbar
            className="shrink-0"
            variant="embedded"
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            searchAriaLabel={searchAriaLabel}
            searchClassName={searchClassName}
            alignControlsEnd={alignControlsEnd}
            columnsControl={columnsControl}
            filters={filters}
            actions={actions}
            disabled={toolbarDisabled}
          />
          <div
            className={cn(
              "flex min-w-0 flex-col",
              constrainHeight && "min-h-0 flex-1 overflow-hidden"
            )}
          >
            {children}
          </div>
        </ListTableCard>
        {pagination}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4",
        constrainHeight && "min-h-0 flex-1 overflow-hidden"
      )}
    >
      {toolbar}
      <div
        className={cn(
          "flex min-w-0 flex-col",
          constrainHeight && "min-h-0 flex-1 overflow-hidden"
        )}
      >
        {children}
      </div>
      {pagination}
    </div>
  );
}
