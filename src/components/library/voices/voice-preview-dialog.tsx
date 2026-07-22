"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Share2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DUMMY_VOICE_RINGTONE,
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/lib/constants/voices";
import {
  getPlayingVoiceId,
  playVoiceRingtone,
  stopVoiceRingtone,
  subscribeVoicePlayback,
  toggleVoiceRingtone,
} from "@/lib/voice-playback";
import { cn } from "@/lib/utils";
import type { VoiceProfile } from "@/types/voice";

interface VoicePreviewDialogProps {
  voice: VoiceProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onChoose?: (voice: VoiceProfile) => void;
  selected?: boolean;
}

export function VoicePreviewDialog({
  voice,
  open,
  onOpenChange,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  onChoose,
  selected = false,
}: VoicePreviewDialogProps) {
  const [playingId, setPlayingId] = useState<string | null>(getPlayingVoiceId);

  useEffect(() => subscribeVoicePlayback(setPlayingId), []);

  useEffect(() => {
    if (!open) stopVoiceRingtone();
  }, [open]);

  if (!voice) return null;

  const isPlaying = playingId === voice.id;
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];

  const handleShare = async () => {
    const shareData = {
      title: `${voice.name} voice`,
      text: voice.description,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(
        `${voice.name} — ${voice.description}`
      );
      toast.success("Voice details copied to clipboard");
    } catch {
      toast.message("Share cancelled");
    }
  };

  const handleListen = () => {
    toggleVoiceRingtone(voice.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-sky-200/80 bg-sky-100/80 text-sky-600 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-400">
              <Volume2 className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="truncate">{voice.name}</DialogTitle>
              <DialogDescription className="line-clamp-2">
                {voice.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-muted/30 px-2 py-0 text-[10px]"
            >
              {voice.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0 text-[10px]",
                genderStyle.className
              )}
            >
              {genderStyle.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0 text-[10px]",
                providerStyle.className
              )}
            >
              {providerStyle.label}
            </Badge>
          </div>

          <div className="rounded-[6px] border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dummy ringtone
            </p>
            <audio
              key={voice.id}
              controls
              src={DUMMY_VOICE_RINGTONE}
              className="w-full"
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[6px]"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[6px]"
              onClick={onBack}
              disabled={!canGoBack}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[6px]"
              onClick={onForward}
              disabled={!canGoForward}
            >
              Forward
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              className="h-10 rounded-[6px]"
              onClick={handleListen}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              Listen
            </Button>
          </div>

          {onChoose && !selected && (
            <Button
              type="button"
              className="w-full rounded-[6px]"
              onClick={() => {
                onChoose(voice);
                void playVoiceRingtone(voice.id);
              }}
            >
              Choose this voice
            </Button>
          )}
          {selected && (
            <p className="text-center text-xs font-medium text-primary">
              This voice is currently selected
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
