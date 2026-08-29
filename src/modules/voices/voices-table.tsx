"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Volume2 } from "lucide-react";
import {
  DataTable,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_ROW_ACCENT_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import {
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/modules/voices/voices-constants";
import {
  resolveVoicePreviewUrl,
  stopVoiceRingtone,
} from "@/modules/voices/voice-playback";
import { cn } from "@/lib/utils";
import type { VoiceProfile } from "@/types/voice";
import { GenderIcon } from "./gender-icons";

function getTableAudio(voiceId: string) {
  return Array.from(
    document.querySelectorAll<HTMLAudioElement>(
      "audio[data-voice-table-preview]"
    )
  ).find((audio) => audio.dataset.voiceId === voiceId);
}

function stopOtherTableAudio(current: HTMLAudioElement) {
  stopVoiceRingtone();
  document
    .querySelectorAll<HTMLAudioElement>("audio[data-voice-table-preview]")
    .forEach((audio) => {
      if (audio !== current) audio.pause();
    });
}

function VoiceIdentityCell({
  voice,
}: {
  voice: VoiceProfile;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = voice.description || "Voice sample";
  const canExpand = description.length > 95;

  const toggleAudio = () => {
    const audio = getTableAudio(voice.id);
    if (!audio) return;

    if (audio.paused) {
      stopOtherTableAudio(audio);
      void audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div className="flex min-w-0 max-w-md items-start gap-2.5 sm:gap-3">
      <button
        type="button"
        data-row-ignore-click
        onClick={toggleAudio}
        className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-muted/70 text-foreground/80 ring-1 ring-border/50 transition-colors hover:bg-brand/10 hover:text-brand hover:ring-brand/20"
        aria-label={`Play or pause ${voice.name}`}
        title="Play or pause voice"
      >
        <Volume2 className="size-3.5" />
      </button>

      <div className="min-w-0">
        <p className={cn(TABLE_PRIMARY_TEXT_CLASS)} title={voice.name}>
          {voice.name}
        </p>
        <p
          className={cn(
            TABLE_SUBTEXT_CLASS,
            "max-w-sm sm:max-w-md",
            !expanded && "line-clamp-1"
          )}
        >
          {description}
        </p>
        {canExpand ? (
          <button
            type="button"
            data-row-ignore-click
            onClick={() => setExpanded((value) => !value)}
            className="mt-0.5 text-[10px] font-medium text-brand hover:underline sm:text-[11px]"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface VoicesTableProps {
  voices: VoiceProfile[];
  isLoading?: boolean;
  embedded?: boolean;
  onColumnsControlReady?: (control: ReactNode | null) => void;
}

export function VoicesTable({
  voices,
  isLoading,
  embedded = false,
  onColumnsControlReady,
}: VoicesTableProps) {
  const columns = useMemo<DataTableColumn<VoiceProfile>[]>(
    () => [
      {
        id: "voice",
        header: "Voice",
        cellClassName: "min-w-48 max-w-72",
        showAccent: true,
        cell: (voice) => <VoiceIdentityCell voice={voice} />,
      },
      {
        id: "preview",
        header: "Preview",
        headerClassName: "min-w-44 w-52 max-w-64",
        cellClassName: "min-w-44 w-52 max-w-64",
        cell: (voice) => (
          <audio
            controls
            preload="metadata"
            src={resolveVoicePreviewUrl(voice.previewUrl)}
            className="h-9 w-full max-w-56"
            aria-label={`Preview ${voice.name}`}
            onPlay={(event) => {
              stopOtherTableAudio(event.currentTarget);
            }}
            data-voice-table-preview
            data-voice-id={voice.id}
          >
            Your browser does not support audio playback.
          </audio>
        ),
      },
      {
        id: "gender",
        header: "Gender",
        cell: (voice) => {
          const genderStyle = VOICE_GENDER_STYLES[voice.gender];
          return (
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium",
                genderStyle.className
              )}
            >
              <GenderIcon
                gender={voice.gender}
                className="mr-1 inline size-3"
              />
              {genderStyle.label}
            </Badge>
          );
        },
      },
      {
        id: "language",
        header: "Language",
        cell: (voice) => (
          <span className="text-xs text-foreground/85">
            {voice.languageLabel || voice.language || "—"}
          </span>
        ),
      },
      {
        id: "provider",
        header: "Provider",
        cell: (voice) => {
          const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
          return (
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium",
                providerStyle.className
              )}
            >
              {providerStyle.label}
            </Badge>
          );
        },
      },
      {
        id: "category",
        header: "Category",
        cell: (voice) => (
          <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/40">
            {voice.category || "—"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      embedded={embedded}
      columnLayoutKey="voices"
      columns={columns}
      data={voices}
      getRowId={(voice) => voice.id}
      isLoading={isLoading}
      emptyIcon={Volume2}
      emptyTitle="No voices found"
      emptyDescription="Try adjusting your filters or search term."
      footerHint="Play and compare voice samples directly in the table."
      minWidthClassName="min-w-200"
      getRowAccentClassName={() => TABLE_ROW_ACCENT_CLASS}
      skeletonRows={6}
      onColumnsControlReady={onColumnsControlReady}
    />
  );
}
