"use client";

/**
 * voices-list.tsx
 * Voice library — browse and preview voices (read-only).
 * Route: /library/voices
 *
 * API calls in this file:
 *   listVoices() → GET /api/voices
 *   getVoice()   → GET /api/voices/:id
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, Volume2 } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { ListTableCard } from "@/components/shared/list-table-card";
import { AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { useDebounce, usePageMeta } from "@/hooks";
import type { PaginatedMeta } from "@/types";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import { filtersToVoicesParams, listVoices } from "./api";
import {
  DEFAULT_VOICE_FILTERS,
  VOICES_PAGE_SIZE,
} from "./voices-constants";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicesPagination } from "./voices-pagination";
import { VoicesTable } from "./voices-table";

const EMPTY_META: PaginatedMeta = {
  page: 1,
  limit: VOICES_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function VoicesListView() {
  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(VOICES_PAGE_SIZE);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnsControl, setColumnsControl] = useState<ReactNode | null>(null);

  const setPageSize = useCallback((limit: number) => {
    setPageSizeState(limit);
    setPage(1);
  }, []);

  const debouncedSearch = useDebounce(filters.search, 300);
  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );
  const activeFiltersKey = useMemo(
    () => JSON.stringify(activeFilters),
    [activeFilters]
  );
  const prevFiltersKeyRef = useRef(activeFiltersKey);

  const loadVoices = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // API: listVoices() → GET /api/voices
      const result = await listVoices(
        filtersToVoicesParams(activeFilters, page, pageSize)
      );
      setVoices(result.data);
      setMeta(result.meta);
      setPage(result.meta.page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong fetching voices."
      );
      setVoices([]);
      setMeta({ ...EMPTY_META, limit: pageSize });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilters, page, pageSize]);

  useEffect(() => {
    const filtersChanged = prevFiltersKeyRef.current !== activeFiltersKey;
    if (filtersChanged) {
      prevFiltersKeyRef.current = activeFiltersKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    let cancelled = false;
    setIsRefreshing(true);
    if (voices.length === 0) setIsLoading(true);
    setError(null);
    (async () => {
      try {
        // API: listVoices() → GET /api/voices
        const result = await listVoices(
          filtersToVoicesParams(activeFilters, page, pageSize)
        );
        if (!cancelled) {
          setVoices(result.data);
          setMeta(result.meta);
          setPage(result.meta.page);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong fetching voices."
          );
          setVoices([]);
          setMeta({ ...EMPTY_META, limit: pageSize });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFiltersKey, page, pageSize]);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Voice Sample",
    breadcrumbs: [
      { label: "Library", href: "/library/voices" },
      { label: "Voices" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const handleReset = () => {
    setFilters(DEFAULT_VOICE_FILTERS);
    setPage(1);
  };

  const showInitialLoader = isLoading && voices.length === 0;
  const isError = Boolean(error);

  return (
    <div className="min-w-0 bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h1 className={PAGE_TITLE_CLASS}>
                Voice Sample
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Browse, filter, and preview available voices. Select the perfect
                voice for your agent.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isError ? (
              <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm">
                <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-destructive/10">
                  <Volume2 className="size-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">Could not load voices</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {error}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-[6px]"
                  onClick={() => void loadVoices()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {showInitialLoader ? (
                  <AppLoader
                    variant="section"
                    label="Loading voices"
                    hint="Fetching voice catalog"
                  />
                ) : (
                  <ListTableCard>
                    <VoiceFiltersSidebar
                      embedded
                      filters={filters}
                      onChange={setFilters}
                      onReset={handleReset}
                      columnsControl={columnsControl}
                    />
                    <VoicesTable
                      embedded
                      voices={voices}
                      isLoading={isRefreshing}
                      onColumnsControlReady={setColumnsControl}
                    />
                  </ListTableCard>
                )}
              </>
            )}

            {!showInitialLoader && !isError && meta.total > 0 && (
              <VoicesPagination
                meta={meta}
                onPageChange={setPage}
                onLimitChange={setPageSize}
              />
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Ready to use a voice?{" "}
            <Link
              href="/survey/new"
              className="font-medium text-primary hover:underline"
            >
              Assign in survey config
            </Link>
          </p>
        </motion.div>
      </PageContainer>
    </div>
  );
}

/** @deprecated Use VoicesListView */
export const VoiceExplorerView = VoicesListView;
