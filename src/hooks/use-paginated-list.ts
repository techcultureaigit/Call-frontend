"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { PaginatedMeta } from "@/types";

export const EMPTY_PAGE_META: PaginatedMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export interface UsePaginatedListOptions<T> {
  /** Default rows per page (limit). Default 10. */
  pageSize?: number;
  debounceMs?: number;
  fetchPage: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{ data: T[]; meta: PaginatedMeta }>;
  /** Reset to page 1 + refetch when these change (e.g. filters) */
  resetPageWhen?: unknown[];
  onError?: (error: unknown) => void;
}

/** Shared search + page + load state for list pages (surveys, users, …). */
export function usePaginatedList<T>({
  pageSize: initialPageSize = 10,
  debounceMs = 300,
  fetchPage,
  resetPageWhen = [],
  onError,
}: UsePaginatedListOptions<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({
    ...EMPTY_PAGE_META,
    limit: initialPageSize,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search, debounceMs);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  const onErrorRef = useRef(onError);

  // Stable string so filter changes always recreate load() even when page stays 1
  const filtersKey = JSON.stringify(resetPageWhen);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const setPageSize = useCallback((limit: number) => {
    setPageSizeState(limit);
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const firstLoad = !hasLoadedRef.current;

    if (firstLoad) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const result = await fetchPageRef.current({
        page,
        limit: pageSize,
        search: debouncedSearch.trim(),
      });
      if (requestId !== requestIdRef.current) return;
      setData(result.data);
      setMeta(result.meta);
      hasLoadedRef.current = true;
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      onErrorRef.current?.(error);
      setData([]);
      setMeta({ ...EMPTY_PAGE_META, limit: pageSize });
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [page, pageSize, debouncedSearch, filtersKey]);

  // Search / filters → page 1 (no-op if already on 1, avoids extra render)
  useEffect(() => {
    setPage((p) => (p === 1 ? p : 1));
  }, [debouncedSearch, filtersKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  /** Reflect clicked page immediately — API meta.page updates only after fetch. */
  const displayMeta = useMemo((): PaginatedMeta => {
    const totalPages = Math.max(meta.totalPages, 1);
    return {
      ...meta,
      page,
      limit: pageSize,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }, [meta, page, pageSize]);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    data,
    meta: displayMeta,
    isLoading,
    isRefreshing,
    reload,
  };
}
