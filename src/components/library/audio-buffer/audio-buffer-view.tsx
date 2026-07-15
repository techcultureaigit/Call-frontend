"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Mic } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks";
import {
  getBuffersForVoice,
  MOCK_AUDIO_BUFFER_CACHE,
} from "@/lib/data/mock-audio-buffer";
import type { AudioBufferEntry, CachedVoice } from "@/types/audio-buffer";
import { AudioBufferListPanel } from "./audio-buffer-list-panel";
import { AvailableVoicesPanel } from "./available-voices-panel";

export function AudioBufferView() {
  const [voices, setVoices] = useState<CachedVoice[]>(
    MOCK_AUDIO_BUFFER_CACHE.voices
  );
  const [buffers, setBuffers] = useState<AudioBufferEntry[]>(
    MOCK_AUDIO_BUFFER_CACHE.buffers
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(
    MOCK_AUDIO_BUFFER_CACHE.voices[0]?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(true);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Audio Buffer",
    breadcrumbs: [
      { label: "Library", href: "/library/voices" },
      { label: "Audio Buffer" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const selectedVoice = useMemo(
    () => voices.find((v) => v.id === selectedVoiceId) ?? null,
    [voices, selectedVoiceId]
  );

  const voiceBuffers = useMemo(() => {
    if (!selectedVoiceId) return [];
    return getBuffersForVoice({ voices, buffers }, selectedVoiceId);
  }, [voices, buffers, selectedVoiceId]);

  const handleDeleteBuffer = (bufferId: string) => {
    if (!selectedVoiceId) return;

    setBuffers((prev) => prev.filter((b) => b.id !== bufferId));
    setVoices((prev) =>
      prev
        .map((v) =>
          v.id === selectedVoiceId
            ? { ...v, bufferCount: Math.max(0, v.bufferCount - 1) }
            : v
        )
        .filter((v) => v.bufferCount > 0)
    );

    toast.success("Audio buffer removed from cache");
  };

  const handlePreview = (buffer: AudioBufferEntry) => {
    toast.message("Playing cached audio", {
      description: buffer.text.slice(0, 80),
    });
  };

  useEffect(() => {
    if (selectedVoiceId && !voices.some((v) => v.id === selectedVoiceId)) {
      setSelectedVoiceId(voices[0]?.id ?? null);
    }
  }, [voices, selectedVoiceId]);

  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8 dark:from-sky-950/25 dark:via-background dark:to-background">
      <PageContainer size="wide" className="px-0 py-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl dark:text-sky-100">
                Audio Buffer Cache
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and preview cached audio snippets for your agents.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          {isLoading ? (
            <Skeleton className="h-[480px] rounded-2xl" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
              <div className="grid lg:grid-cols-[minmax(240px,32%)_1fr]">
                <AvailableVoicesPanel
                  voices={voices}
                  selectedId={selectedVoiceId}
                  onSelect={setSelectedVoiceId}
                />
                <AudioBufferListPanel
                  selectedVoice={selectedVoice}
                  buffers={voiceBuffers}
                  onPreview={handlePreview}
                  onDelete={handleDeleteBuffer}
                />
              </div>
            </div>
          )}

          {!isLoading && voices.length === 0 && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
              <Mic className="size-4 shrink-0" />
              Cached audio appears here after agents generate TTS snippets during
              calls.
            </div>
          )}
        </motion.div>
      </PageContainer>
    </div>
  );
}
