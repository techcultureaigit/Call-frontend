"use client";

import type { ReactNode } from "react";
import { DataPagination } from "@/components/shared/data-pagination";
import { ListTableCard } from "@/components/shared/list-table-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
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
  onLimitChange?: (limit: number) => void;
  limitOptions?: readonly number[];
  itemLabel?: string;
  children: ReactNode;
  unified?: boolean;
  /** @deprecated Kept for API compat — height is content-driven + max scroll. */
  constrainHeight?: boolean;
}

/** Shared list layout: toolbar + table (max ~10 rows, then scroll) + pagination flush under rows. */
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
      className="shrink-0 border-t border-border/50 bg-card px-3 py-2.5 sm:px-4"
    />
  );

  if (unified) {
    return (
      <ListTableCard className="flex flex-col overflow-hidden">
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
        <div className="min-w-0">{children}</div>
        {pagination}
      </ListTableCard>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {toolbar}
      <div className="min-w-0">{children}</div>
      {pagination}
    </div>
  );
}
