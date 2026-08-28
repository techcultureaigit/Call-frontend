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
  itemLabel?: string;
  children: ReactNode;
  /** Full-height layout with toolbar + table as separate cards */
  unified?: boolean;
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

  if (unified) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListTableCard className="flex min-h-0 flex-1 flex-col">
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </ListTableCard>
        <DataPagination
          meta={meta}
          onPageChange={onPageChange}
          itemLabel={itemLabel}
          variant="inline"
          className="shrink-0"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      {toolbar}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <DataPagination
        meta={meta}
        onPageChange={onPageChange}
        itemLabel={itemLabel}
        variant="inline"
        className="shrink-0"
      />
    </div>
  );
}
