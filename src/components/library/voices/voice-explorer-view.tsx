"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useDebounce, usePageMeta, useVoices } from "@/hooks";
import {
  DEFAULT_VOICE_FILTERS,
  VOICES_PAGE_SIZE,
} from "@/lib/constants/voices";
import { stopVoiceRingtone } from "@/lib/voice-playback";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicePreviewDialog } from "./voice-preview-dialog";
import { VoicesPagination } from "./voices-pagination";
import { VoicesTable } from "./voices-table";

export function VoiceExplorerView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewFromUrl = searchParams.get("preview");

  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(
    previewFromUrl
  );

  const debouncedSearch = useDebounce(filters.search, 300);
  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useVoices(
    activeFilters,
    page,
    VOICES_PAGE_SIZE
  );

  const voices = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: VOICES_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

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
    setPage(1);
  }, [debouncedSearch, filters.gender, filters.language]);

  useEffect(() => {
    if (previewFromUrl) setPreviewVoiceId(previewFromUrl);
  }, [previewFromUrl]);

  const syncPreviewInUrl = (voiceId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (voiceId) params.set("preview", voiceId);
    else params.delete("preview");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

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
    previewIndex >= 0
      ? voices[previewIndex]
      : previewVoiceId
        ? (voices.find((v) => v.id === previewVoiceId) ?? null)
        : null;

  const showSkeleton = isLoading && !data;

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
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong fetching voices."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-[6px]"
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div
                className={
                  isFetching && !showSkeleton
                    ? "opacity-70 transition-opacity"
                    : ""
                }
              >
                <VoicesTable
                  voices={voices}
                  selectedVoiceId={selectedVoiceId}
                  onOpen={handleOpenVoice}
                  onUse={handleUse}
                  isLoading={showSkeleton}
                />
              </div>
            )}

            <VoicePreviewDialog
              voice={previewVoice}
              open={Boolean(previewVoice)}
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

            {!showSkeleton && !isError && meta.total > 0 && (
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
