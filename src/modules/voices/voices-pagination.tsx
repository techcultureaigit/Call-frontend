"use client";

import { DataPagination } from "@/components/shared/data-pagination";
import type { PaginatedMeta } from "@/types";

interface VoicesPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

/** Thin wrapper — shared DataPagination (same as DataTable pattern). */
export function VoicesPagination({
  meta,
  onPageChange,
  onLimitChange,
}: VoicesPaginationProps) {
  return (
    <DataPagination
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      itemLabel="voices"
      variant="inline"
    />
  );
}
