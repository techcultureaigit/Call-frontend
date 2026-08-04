"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { HelpCircle, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, usePageMeta, useVoices } from "@/hooks";
import {
  DEFAULT_VOICE_FILTERS,
  VOICES_PAGE_SIZE,
} from "@/lib/constants/voices";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import { SortableVoiceCard } from "./voice-card";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicePreviewDialog } from "./voice-preview-dialog";
import { VoicesPagination } from "./voices-pagination";

export function VoiceExplorerView() {
  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);

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

  const voices = data?.data;
  const voiceList = voices ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: VOICES_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    if (!voices) return;
    setOrderedIds((prev) => {
      const nextIds = voices.map((v) => v.id);
      if (prev.length === 0) return nextIds;
      const kept = prev.filter((id) => nextIds.includes(id));
      const newcomers = nextIds.filter((id) => !kept.includes(id));
      return [...kept, ...newcomers];
    });
  }, [voices]);

  const orderedVoices = useMemo(() => {
    const byId = new Map(voiceList.map((v) => [v.id, v]));
    return orderedIds
      .map((id) => byId.get(id))
      .filter((v): v is VoiceProfile => Boolean(v));
  }, [voiceList, orderedIds]);

  const handleReset = () => {
    setFilters(DEFAULT_VOICE_FILTERS);
    setPage(1);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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
  };

  const previewIndex = orderedVoices.findIndex((v) => v.id === previewVoiceId);
  const previewVoice = previewIndex >= 0 ? orderedVoices[previewIndex] : null;

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
                Browse, filter, and preview available voices. Drag cards to
                reorder, or assign the perfect voice to your agent.
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

            {showSkeleton ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-[6px]" />
                ))}
              </div>
            ) : isError ? (
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
            ) : orderedVoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm">
                <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                  <Volume2 className="size-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No voices found</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Try adjusting your filters or search term.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-[6px]"
                  onClick={handleReset}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className={isFetching ? "opacity-70 transition-opacity" : ""}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedVoices.map((v) => v.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {orderedVoices.map((voice, i) => (
                        <SortableVoiceCard
                          key={voice.id}
                          voice={voice}
                          index={i}
                          selected={voice.id === selectedVoiceId}
                          onOpen={handleOpenVoice}
                          onUse={handleUse}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            <VoicePreviewDialog
              voice={previewVoice}
              open={Boolean(previewVoice)}
              onOpenChange={(open) => {
                if (!open) setPreviewVoiceId(null);
              }}
              canGoBack={previewIndex > 0}
              canGoForward={
                previewIndex >= 0 && previewIndex < orderedVoices.length - 1
              }
              onBack={() => {
                if (previewIndex > 0) {
                  setPreviewVoiceId(orderedVoices[previewIndex - 1].id);
                }
              }}
              onForward={() => {
                if (
                  previewIndex >= 0 &&
                  previewIndex < orderedVoices.length - 1
                ) {
                  setPreviewVoiceId(orderedVoices[previewIndex + 1].id);
                }
              }}
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
