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
import { useDebounce, usePageMeta } from "@/hooks";
import { VOICES_PAGE_SIZE } from "@/lib/constants/voices";
import {
  DEFAULT_VOICE_FILTERS,
  filterVoices,
  MOCK_VOICES,
  paginateVoices,
} from "@/lib/data/mock-voices";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";
import { SortableVoiceCard, VoiceCloneButton } from "./voice-card";
import { VoiceFiltersSidebar } from "./voice-filters-sidebar";
import { VoicePreviewDialog } from "./voice-preview-dialog";
import { VoicesPagination } from "./voices-pagination";

export function VoiceExplorerView() {
  const [filters, setFilters] = useState<VoiceFilters>(DEFAULT_VOICE_FILTERS);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(
    () => MOCK_VOICES[0]?.id ?? null
  );
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, 300);

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

  useEffect(() => {
    setOrderedIds((prev) => {
      const nextIds = filtered.map((v) => v.id);
      if (prev.length === 0) return nextIds;
      const kept = prev.filter((id) => nextIds.includes(id));
      const newcomers = nextIds.filter((id) => !kept.includes(id));
      return [...kept, ...newcomers];
    });
  }, [filtered]);

  const orderedVoices = useMemo(() => {
    const byId = new Map(filtered.map((v) => [v.id, v]));
    return orderedIds
      .map((id) => byId.get(id))
      .filter((v): v is VoiceProfile => Boolean(v));
  }, [filtered, orderedIds]);

  const { voices, meta } = useMemo(
    () => paginateVoices(orderedVoices, page, VOICES_PAGE_SIZE),
    [orderedVoices, page]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.voiceType, filters.gender, filters.language]);

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
    setSelectedVoiceId(voice.id);
    toast.success(`"${voice.name}" selected for your agent`);
  };

  const handleOpenVoice = (voice: VoiceProfile) => {
    setPreviewVoiceId(voice.id);
  };

  const previewIndex = voices.findIndex((v) => v.id === previewVoiceId);
  const previewVoice = previewIndex >= 0 ? voices[previewIndex] : null;

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
                Browse, filter, and preview available voices. Drag cards to
                reorder, or clone and assign the perfect voice to your agent.
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

          <div className="space-y-5">
            <VoiceFiltersSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
            />

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-[6px]" />
                ))}
              </div>
            ) : voices.length === 0 ? (
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={voices.map((v) => v.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {voices.map((voice, i) => (
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
            )}

            <VoicePreviewDialog
              voice={previewVoice}
              open={Boolean(previewVoice)}
              onOpenChange={(open) => {
                if (!open) setPreviewVoiceId(null);
              }}
              canGoBack={previewIndex > 0}
              canGoForward={
                previewIndex >= 0 && previewIndex < voices.length - 1
              }
              onBack={() => {
                if (previewIndex > 0) {
                  setPreviewVoiceId(voices[previewIndex - 1].id);
                }
              }}
              onForward={() => {
                if (previewIndex >= 0 && previewIndex < voices.length - 1) {
                  setPreviewVoiceId(voices[previewIndex + 1].id);
                }
              }}
              selected={previewVoice?.id === selectedVoiceId}
              onChoose={handleUse}
            />

            {!isLoading && meta.total > 0 && (
              <VoicesPagination meta={meta} onPageChange={setPage} />
            )}
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
