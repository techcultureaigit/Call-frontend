"use client";

import { Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import type { AudioBufferEntry, CachedVoice } from "@/types/audio-buffer";

interface AudioBufferListPanelProps {
  selectedVoice: CachedVoice | null;
  buffers: AudioBufferEntry[];
  onPreview: (buffer: AudioBufferEntry) => void;
  onDelete: (bufferId: string) => void;
}

export function AudioBufferListPanel({
  selectedVoice,
  buffers,
  onPreview,
  onDelete,
}: AudioBufferListPanelProps) {
  const title = selectedVoice
    ? `Audio Buffer List - ${selectedVoice.name}`
    : "Audio Buffer List -";

  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground dark:text-foreground">
          🎙️ {title}
        </h2>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-h-[240px] flex-1 flex-col rounded-[6px] border border-border/50 bg-muted/10">
          {!selectedVoice ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Select a voice to view cached audio buffers.
              </p>
            </div>
          ) : buffers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-sm text-muted-foreground">
                No audio buffers found for this voice.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40 overflow-auto p-2">
              {buffers.map((buffer) => (
                <li
                  key={buffer.id}
                  className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/30"
                >
                  <button
                    type="button"
                    onClick={() => onPreview(buffer)}
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-sky-200/80 bg-sky-100/80 text-sky-600 transition-colors hover:bg-sky-200/80 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-400"
                    aria-label="Preview audio"
                  >
                    <Play className="size-4 fill-current" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-foreground">
                      {buffer.text}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {buffer.durationSeconds.toFixed(1)}s · {buffer.sizeKb} KB
                      · Cached {formatAgentCreatedAt(buffer.cachedAt)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onDelete(buffer.id)}
                    aria-label="Delete buffer"
                  >
                    <Trash2 className="size-3.5 text-red-600" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
