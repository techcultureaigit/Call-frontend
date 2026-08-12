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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { useDebounce, usePageMeta } from "@/hooks";
import type { PaginatedMeta } from "@/types";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import {
  filtersToVoicesParams,
  getVoice,
  listVoices,
} from "./api";
import {
  DEFAULT_VOICE_FILTERS,
  VOICES_PAGE_SIZE,
} from "./voices-constants";
import { stopVoiceRingtone } from "./voice-playback";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicePreviewDialog } from "./voice-preview-dialog";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewFromUrl = searchParams.get("preview");

  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(
    previewFromUrl
  );
  const [previewVoiceFallback, setPreviewVoiceFallback] =
    useState<VoiceProfile | null>(null);
  const [isFetchingPreviewVoice, setIsFetchingPreviewVoice] = useState(false);

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
        filtersToVoicesParams(activeFilters, page, VOICES_PAGE_SIZE)
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
      setMeta(EMPTY_META);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilters, page]);

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
          filtersToVoicesParams(activeFilters, page, VOICES_PAGE_SIZE)
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
          setMeta(EMPTY_META);
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
  }, [activeFiltersKey, page]);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Voice Explorer",
    breadcrumbs: [
      { label: "Library", href: "/library/voices" },
      { label: "Voices" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    if (previewFromUrl) setPreviewVoiceId(previewFromUrl);
  }, [previewFromUrl]);

  const syncPreviewInUrl = useCallback(
    (voiceId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (voiceId) params.set("preview", voiceId);
      else params.delete("preview");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const previewVoiceFromList = previewVoiceId
    ? voices.find((v) => v.id === previewVoiceId) ?? null
    : null;

  useEffect(() => {
    if (!previewVoiceId || previewVoiceFromList) {
      setPreviewVoiceFallback(null);
      setIsFetchingPreviewVoice(false);
      return;
    }

    let cancelled = false;
    setIsFetchingPreviewVoice(true);
    (async () => {
      try {
        // API: getVoice() → GET /api/voices/:id
        const voice = await getVoice(previewVoiceId);
        if (!cancelled) setPreviewVoiceFallback(voice);
      } catch {
        if (!cancelled) {
          toast.error("Could not load this voice preview");
          setPreviewVoiceId(null);
          syncPreviewInUrl(null);
          setPreviewVoiceFallback(null);
        }
      } finally {
        if (!cancelled) setIsFetchingPreviewVoice(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [previewVoiceId, previewVoiceFromList, syncPreviewInUrl]);

  const handleReset = () => {
    setFilters(DEFAULT_VOICE_FILTERS);
    setPage(1);
  };

  const handleUse = (voice: VoiceProfile) => {
    if (selectedVoiceId === voice.id) {
      setSelectedVoiceId(null);
      toast.message(`"${voice.name}" unselected`);
      return;
    }
    setSelectedVoiceId(voice.id);
    toast.success(`"${voice.name}" selected`);
  };

  const handleOpenVoice = (voice: VoiceProfile) => {
    setPreviewVoiceId(voice.id);
    syncPreviewInUrl(voice.id);
  };

  const goToPreviewIndex = (index: number) => {
    const next = voices[index];
    if (!next) return;
    stopVoiceRingtone();
    setPreviewVoiceId(next.id);
    syncPreviewInUrl(next.id);
  };

  const previewIndex = voices.findIndex((v) => v.id === previewVoiceId);
  const previewVoice =
    previewIndex >= 0 ? voices[previewIndex] : previewVoiceFallback;

  const showInitialLoader = isLoading && voices.length === 0;
  const isError = Boolean(error);

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Voice Explorer
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

          <div className="space-y-5">
            <VoiceFiltersSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
            />

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
                ) : null}
                {voices.length > 0 || !showInitialLoader ? (
                  <VoicesTable
                    voices={voices}
                    selectedVoiceId={selectedVoiceId}
                    onOpen={handleOpenVoice}
                    onUse={handleUse}
                    isLoading={isRefreshing}
                  />
                ) : null}
              </>
            )}

            <VoicePreviewDialog
              voice={previewVoice}
              open={
                Boolean(previewVoiceId) &&
                (Boolean(previewVoice) || isFetchingPreviewVoice)
              }
              onOpenChange={(open) => {
                if (!open) {
                  setPreviewVoiceId(null);
                  syncPreviewInUrl(null);
                }
              }}
              canGoBack={previewIndex > 0}
              canGoForward={
                previewIndex >= 0 && previewIndex < voices.length - 1
              }
              onBack={() => goToPreviewIndex(previewIndex - 1)}
              onForward={() => goToPreviewIndex(previewIndex + 1)}
              selected={previewVoice?.id === selectedVoiceId}
              onChoose={handleUse}
            />

            {!showInitialLoader && !isError && meta.total > 0 && (
              <VoicesPagination meta={meta} onPageChange={setPage} />
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
