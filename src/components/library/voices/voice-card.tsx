"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";
import {
  Mars,
  NonBinary,
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
  onPreview: (voice: VoiceProfile) => void;
  onUse: (voice: VoiceProfile) => void;
}

export function VoiceCard({
  voice,
  index = 0,
  onPreview,
  onUse,
}: VoiceCardProps) {
  const GenderIcon = GENDER_ICONS[voice.gender];
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group flex gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-card transition-all hover:border-primary/20 hover:shadow-elevated"
    >
      <button
        type="button"
        onClick={() => onPreview(voice)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-sky-200/80 bg-sky-100/80 text-sky-600 transition-colors hover:bg-sky-200/80 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-400"
        aria-label={`Preview ${voice.name}`}
      >
        <Volume2 className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-[#1e3a5f] dark:text-foreground">
            {voice.name}
          </h3>
          {voice.isCloned && (
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
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

      <Button
        size="sm"
        className="h-8 shrink-0 self-end rounded-lg px-4"
        onClick={() => onUse(voice)}
      >
        Use
      </Button>
    </motion.article>
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
