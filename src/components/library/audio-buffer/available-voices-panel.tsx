"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CachedVoice } from "@/types/audio-buffer";

interface AvailableVoicesPanelProps {
  voices: CachedVoice[];
  selectedId: string | null;
  onSelect: (voiceId: string) => void;
}

export function AvailableVoicesPanel({
  voices,
  selectedId,
  onSelect,
}: AvailableVoicesPanelProps) {
  return (
    <div className="flex flex-col border-r border-border/40">
      <div className="border-b border-border/40 px-5 py-4">
        <h2 className="text-sm font-semibold text-[#1e3a5f] dark:text-foreground">
          Available Voices
        </h2>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {voices.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No voices found in cache.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {voices.map((voice) => {
              const isActive = selectedId === voice.id;
              return (
                <li key={voice.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(voice.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-subtle ring-1 ring-primary/20"
                        : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                      )}
                    >
                      <Volume2 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{voice.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {voice.provider} · {voice.bufferCount} cached
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
