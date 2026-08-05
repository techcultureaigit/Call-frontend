"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Square,
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
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/modules/voices/voices-constants";
import {
  resolveVoicePreviewUrl,
  setPlayingVoiceId,
  stopVoiceRingtone,
} from "@/modules/voices/voice-playback";
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

function buildVoiceShareUrl(voice: VoiceProfile): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.pathname = "/library/voices";
  url.searchParams.set("preview", voice.id);
  return url.toString();
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceIdRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  voiceIdRef.current = voice?.id ?? null;

  const bindAudio = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (!el) return;

    const onPlay = () => {
      setIsPlaying(true);
      if (voiceIdRef.current) setPlayingVoiceId(voiceIdRef.current);
    };
    const onPauseOrEnd = () => {
      setIsPlaying(false);
      setPlayingVoiceId(null);
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("playing", onPlay);
    el.addEventListener("pause", onPauseOrEnd);
    el.addEventListener("ended", onPauseOrEnd);

    // Store removers on the element for cleanup when ref changes
    (
      el as HTMLAudioElement & {
        __voiceCleanup?: () => void;
      }
    ).__voiceCleanup = () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("playing", onPlay);
      el.removeEventListener("pause", onPauseOrEnd);
      el.removeEventListener("ended", onPauseOrEnd);
    };
  }, []);

  const audioCallbackRef = useCallback(
    (el: HTMLAudioElement | null) => {
      const prev = audioRef.current as
        | (HTMLAudioElement & { __voiceCleanup?: () => void })
        | null;
      prev?.__voiceCleanup?.();
      bindAudio(el);
    },
    [bindAudio]
  );

  // Stop shared ringtone + reset when dialog opens/closes
  useEffect(() => {
    stopVoiceRingtone();
    setIsPlaying(false);
    if (!open) setPlayingVoiceId(null);
  }, [open]);

  // Reset player when switching voice
  useEffect(() => {
    setIsPlaying(false);
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, [voice?.id]);

  // Keyboard: ← Back, → Forward
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], audio"
        )
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && canGoBack) {
        event.preventDefault();
        onBack?.();
      }
      if (event.key === "ArrowRight" && canGoForward) {
        event.preventDefault();
        onForward?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, canGoBack, canGoForward, onBack, onForward]);

  if (!voice) return null;

  const genderStyle = VOICE_GENDER_STYLES[voice.gender];
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const audioSrc = resolveVoicePreviewUrl(voice.previewUrl);

  const handleShare = async () => {
    const shareUrl = buildVoiceShareUrl(voice);
    const shareText = [
      voice.name,
      voice.description,
      `${genderStyle.label} · ${providerStyle.label}`,
      shareUrl,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${voice.name} — Voice Survey`,
          text: voice.description,
          url: shareUrl,
        });
        toast.success("Voice shared");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      toast.success("Voice link copied to clipboard");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl || shareText);
        toast.success("Voice link copied to clipboard");
      } catch {
        toast.error("Could not share this voice");
      }
    }
  };

  const pausePreview = () => {
    const el = audioRef.current;
    if (el && !el.paused) el.pause();
    setIsPlaying(false);
    setPlayingVoiceId(null);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    pausePreview();
    onBack?.();
  };

  const handleForward = () => {
    if (!canGoForward) return;
    pausePreview();
    onForward?.();
  };

  const handleListen = async () => {
    const el = audioRef.current;
    if (!el) return;

    stopVoiceRingtone();

    // Playing → stop (icon → Play)
    if (!el.paused && !el.ended) {
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
      setPlayingVoiceId(null);
      return;
    }

    // Stopped → start (icon → Stop)
    try {
      el.currentTime = 0;
      setIsPlaying(true);
      setPlayingVoiceId(voice.id);
      await el.play();
    } catch {
      toast.error("Could not play this voice preview");
      setIsPlaying(false);
      setPlayingVoiceId(null);
    }
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
              {voice.previewUrl ? "Voice preview" : "Dummy ringtone"}
            </p>
            <audio
              ref={audioCallbackRef}
              controls
              src={audioSrc}
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
              onClick={() => void handleShare()}
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[6px]"
              onClick={handleBack}
              disabled={!canGoBack}
              title={canGoBack ? "Previous voice (←)" : "No previous voice"}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[6px]"
              onClick={handleForward}
              disabled={!canGoForward}
              title={canGoForward ? "Next voice (→)" : "No next voice"}
            >
              Forward
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              className="h-10 rounded-[6px]"
              onClick={() => void handleListen()}
              aria-label={isPlaying ? "Stop preview" : "Play preview"}
            >
              {isPlaying ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
              {isPlaying ? "Stop" : "Listen"}
            </Button>
          </div>

          {onChoose && (
            <Button
              type="button"
              variant={selected ? "outline" : "default"}
              className="w-full rounded-[6px]"
              onClick={() => {
                onChoose(voice);
                if (!selected) {
                  void handleListen();
                } else {
                  pausePreview();
                }
              }}
            >
              {selected ? "Unselect this voice" : "Choose this voice"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
