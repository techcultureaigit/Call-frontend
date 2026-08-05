"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  pageSize?: number;
  debounceMs?: number;
  fetchPage: (params: {
    page: number;
    limit: number;
    search: string;
  }) => Promise<{ data: T[]; meta: PaginatedMeta }>;
  /** Reset to page 1 when these change (e.g. filters) */
  resetPageWhen?: unknown[];
  onError?: (error: unknown) => void;
}

/** Shared search + page + load state for list pages (surveys, results, users, …). */
export function usePaginatedList<T>({
  pageSize = 10,
  debounceMs = 300,
  fetchPage,
  resetPageWhen = [],
  onError,
}: UsePaginatedListOptions<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({
    ...EMPTY_PAGE_META,
    limit: pageSize,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search, debounceMs);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

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
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, ...resetPageWhen]);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    data,
    meta,
    isLoading,
    isRefreshing,
    reload,
  };
}
