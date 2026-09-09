"use client";

import { DataPagination } from "@/components/shared/data-pagination";
import type { PaginatedMeta } from "@/types";

interface UsersPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

/** Thin wrapper — shared DataPagination (same as DataTable pattern). */
export function UsersPagination({
  meta,
  onPageChange,
  onLimitChange,
}: UsersPaginationProps) {
  return (
    <DataPagination
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      itemLabel="users"
      variant="inline"
      className="shrink-0 border-t border-border/50 bg-card px-3 py-2.5 sm:px-4"
    />
  );
}
