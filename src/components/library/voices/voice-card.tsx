"use client";

import { useEffect, useState, type ElementType, type HTMLAttributes } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  GripVertical,
  Mars,
  NonBinary,
  Pause,
  Sparkles,
  Star,
  Venus,
  Volume2,
} from "lucide-react";
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
import type { VoiceGender, VoiceProfile } from "@/types/voice";

const GENDER_ICONS: Record<VoiceGender, ElementType> = {
  feminine: Venus,
  masculine: Mars,
  neutral: NonBinary,
};

interface VoiceCardProps {
  voice: VoiceProfile;
  index?: number;
  selected?: boolean;
  onOpen: (voice: VoiceProfile) => void;
  onUse: (voice: VoiceProfile) => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

export function VoiceCard({
  voice,
  index = 0,
  selected = false,
  onOpen,
  onUse,
  dragHandleProps,
  isDragging = false,
}: VoiceCardProps) {
  const GenderIcon = GENDER_ICONS[voice.gender];
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];
  const [playingId, setPlayingId] = useState<string | null>(getPlayingVoiceId);
  const isPlaying = playingId === voice.id;

  useEffect(() => subscribeVoicePlayback(setPlayingId), []);

  return (
    <motion.article
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => onOpen(voice)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(voice);
        }
      }}
      className={cn(
        "group flex cursor-pointer gap-3 rounded-2xl border bg-card p-4 shadow-card transition-all hover:shadow-elevated",
        selected
          ? "border-primary/50 ring-2 ring-primary/15"
          : "border-border/40 hover:border-primary/20",
        isDragging && "border-primary/40 shadow-elevated ring-2 ring-primary/15"
      )}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="mt-0.5 flex size-8 shrink-0 cursor-grab items-center justify-center self-start rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label={`Reorder ${voice.name}`}
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps}
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleVoiceRingtone(voice.id);
        }}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors",
          isPlaying
            ? "border-primary/40 bg-primary text-primary-foreground"
            : "border-sky-200/80 bg-sky-100/80 text-sky-600 hover:bg-sky-200/80 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-400"
        )}
        aria-label={isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`}
      >
        {isPlaying ? (
          <Pause className="size-5" />
        ) : (
          <Volume2 className="size-5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground dark:text-foreground">
            {voice.name}
          </h3>
          {voice.isCloned && (
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
          )}
          {selected && (
            <Badge className="rounded-full px-2 py-0 text-[10px] font-semibold">
              Selected
            </Badge>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="rounded-full border-border/60 bg-muted/30 px-2 py-0 text-[10px] font-medium"
          >
            {voice.category}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-1.5 py-0 text-[10px] font-medium",
              genderStyle.className
            )}
          >
            <GenderIcon className="mr-1 inline size-3" />
            {genderStyle.label}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2 py-0 text-[10px] font-medium",
              providerStyle.className
            )}
          >
            {providerStyle.label}
          </Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {voice.description}
        </p>
      </div>

      {selected ? (
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0 self-end rounded-lg border-primary/40 bg-primary/10 px-4 text-primary hover:bg-primary/15 hover:text-primary"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          Selected
        </Button>
      ) : (
        <Button
          size="sm"
          className="h-8 shrink-0 self-end rounded-lg px-4"
          onClick={(e) => {
            e.stopPropagation();
            onUse(voice);
          }}
        >
          Choose
        </Button>
      )}
    </motion.article>
  );
}

interface SortableVoiceCardProps {
  voice: VoiceProfile;
  index?: number;
  selected?: boolean;
  onOpen: (voice: VoiceProfile) => void;
  onUse: (voice: VoiceProfile) => void;
}

export function SortableVoiceCard({
  voice,
  index,
  selected,
  onOpen,
  onUse,
}: SortableVoiceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: voice.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "z-20 opacity-90")}
    >
      <VoiceCard
        voice={voice}
        index={index}
        selected={selected}
        onOpen={onOpen}
        onUse={onUse}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface VoiceCloneBannerProps {
  onClone: () => void;
}

export function VoiceCloneButton({ onClone }: VoiceCloneBannerProps) {
  return (
    <Button className="rounded-xl" onClick={onClone}>
      <Sparkles className="size-4" />
      Voice Clone
    </Button>
  );
}
