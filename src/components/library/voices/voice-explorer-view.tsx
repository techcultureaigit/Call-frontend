"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, usePageMeta } from "@/hooks";
import { VOICES_PAGE_SIZE } from "@/lib/constants/voices";
import {
  DEFAULT_VOICE_FILTERS,
  filterVoices,
  MOCK_VOICES,
  paginateVoices,
} from "@/lib/data/mock-voices";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import { VoiceCard, VoiceCloneButton } from "./voice-card";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicesPagination } from "./voices-pagination";

export function VoiceExplorerView() {
  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(filters.search, 300);

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
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filtered = useMemo(
    () => filterVoices(MOCK_VOICES, activeFilters),
    [activeFilters]
  );

  const { voices, meta } = useMemo(
    () => paginateVoices(filtered, page, VOICES_PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.voiceType, filters.gender, filters.language]);

  const handleReset = () => {
    setFilters(DEFAULT_VOICE_FILTERS);
    setPage(1);
  };

  const handlePreview = (voice: VoiceProfile) => {
    toast.message(`Playing preview: ${voice.name}`, {
      description: `${voice.category} · ${voice.languageLabel}`,
    });
  };

  const handleUse = (voice: VoiceProfile) => {
    toast.success(`"${voice.name}" selected for your agent`);
  };

  const handleClone = () => {
    toast.info("Voice Clone", {
      description: "Upload a sample to clone a custom voice profile.",
    });
  };

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
                Browse, filter, and preview available voices. Clone or assign
                the perfect voice to your agent.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start">
              <VoiceCloneButton onClone={handleClone} />
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <VoiceFiltersSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
            />

            <div className="space-y-5">
              {isLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
              ) : voices.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Volume2 className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">No voices found</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Try adjusting your filters or search term.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={handleReset}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {voices.map((voice, i) => (
                    <VoiceCard
                      key={voice.id}
                      voice={voice}
                      index={i}
                      onPreview={handlePreview}
                      onUse={handleUse}
                    />
                  ))}
                </div>
              )}

              {!isLoading && meta.total > 0 && (
                <VoicesPagination
                  meta={meta}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Need a custom voice?{" "}
            <button
              type="button"
              onClick={handleClone}
              className="font-medium text-primary hover:underline"
            >
              Clone your own
            </button>{" "}
            or{" "}
            <Link
              href="/agents/new"
              className="font-medium text-primary hover:underline"
            >
              assign in agent config
            </Link>
          </p>
        </motion.div>
      </PageContainer>
    </div>
  );
}
