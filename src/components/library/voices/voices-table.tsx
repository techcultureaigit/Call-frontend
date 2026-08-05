"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pause, Volume2 } from "lucide-react";
import {
  DataTable,
  DataTableActionButton,
  DataTableActionDivider,
  DataTableActionGroup,
  DataTablePrimaryCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/lib/constants/voices";
import {
  getPlayingVoiceId,
  subscribeVoicePlayback,
  toggleVoiceRingtone,
} from "@/lib/voice-playback";
import { cn } from "@/lib/utils";
import type { VoiceProfile } from "@/types/voice";
import { GenderIcon } from "./gender-icons";

interface VoicesTableProps {
  voices: VoiceProfile[];
  selectedVoiceId?: string | null;
  onOpen: (voice: VoiceProfile) => void;
  onUse: (voice: VoiceProfile) => void;
  isLoading?: boolean;
}

export function VoicesTable({
  voices,
  selectedVoiceId = null,
  onOpen,
  onUse,
  isLoading,
}: VoicesTableProps) {
  const [playingId, setPlayingId] = useState<string | null>(getPlayingVoiceId);

  useEffect(() => subscribeVoicePlayback(setPlayingId), []);

  const columns = useMemo<DataTableColumn<VoiceProfile>[]>(
    () => [
      {
        id: "voice",
        header: "Voice",
        headerClassName: "pl-5",
        cellClassName: "pl-5",
        showAccent: true,
        cell: (voice) => {
          const selected = voice.id === selectedVoiceId;
          const isPlaying = playingId === voice.id;
          return (
            <DataTablePrimaryCell
              selected={selected}
              icon={
                <button
                  type="button"
                  data-row-ignore-click
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVoiceRingtone(voice.id, voice.previewUrl);
                  }}
                  className={cn(
                    "flex size-full items-center justify-center rounded-[8px]",
                    isPlaying && "brand-gradient text-brand-foreground"
                  )}
                  aria-label={
                    isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`
                  }
                >
                  {isPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
              }
              title={voice.name}
              subtitle={voice.description || "Click to preview this voice"}
            />
          );
        },
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
          <span className="text-sm text-foreground/85">
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
      {
        id: "actions",
        header: "Actions",
        align: "right",
        cell: (voice) => {
          const selected = voice.id === selectedVoiceId;
          return (
            <DataTableActionGroup>
              <DataTableActionButton
                label={`Preview ${voice.name}`}
                onClick={() => onOpen(voice)}
                tone="sky"
              >
                <Volume2 className="size-3.5" />
              </DataTableActionButton>
              <DataTableActionDivider />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-[5px] px-2.5 text-[11px] font-medium",
                  selected
                    ? "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                    : "text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-800"
                )}
                onClick={() => onUse(voice)}
              >
                {selected ? (
                  <>
                    <Check className="mr-1 size-3.5" />
                    Selected
                  </>
                ) : (
                  "Choose"
                )}
              </Button>
            </DataTableActionGroup>
          );
        },
      },
    ],
    [onOpen, onUse, playingId, selectedVoiceId]
  );

  return (
    <DataTable
      columns={columns}
      data={voices}
      getRowId={(voice) => voice.id}
      onRowClick={onOpen}
      isLoading={isLoading}
      emptyIcon={Volume2}
      emptyTitle="No voices found"
      emptyDescription="Try adjusting your filters or search term."
      footerHint="Click a row to open preview. Use Choose to select a voice for your agent."
      minWidthClassName="min-w-215"
      isRowSelected={(voice) => voice.id === selectedVoiceId}
      getRowAccentClassName={() => "bg-brand"}
      skeletonRows={6}
    />
  );
}
