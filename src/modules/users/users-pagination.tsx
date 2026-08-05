"use client";

import { DataPagination } from "@/components/shared/data-pagination";
import type { PaginatedMeta } from "@/types";

interface UsersPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

/** Thin wrapper — shared DataPagination (same as DataTable pattern). */
export function UsersPagination({ meta, onPageChange }: UsersPaginationProps) {
  return (
    <DataPagination
      meta={meta}
      onPageChange={onPageChange}
      itemLabel="users"
      variant="inline"
    />
  );
}
