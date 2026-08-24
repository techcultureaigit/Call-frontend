"use client";

import { DataPagination } from "@/components/shared/data-pagination";
import type { PaginatedMeta } from "@/types";

interface VoicesPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

/** Thin wrapper — shared DataPagination (same as DataTable pattern). */
export function VoicesPagination({ meta, onPageChange }: VoicesPaginationProps) {
  return (
    <DataPagination
      meta={meta}
      onPageChange={onPageChange}
      itemLabel="voices"
      variant="inline"
    />
  );
}
