"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { GenderIcon } from "@/modules/voices/gender-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks";
import {
  DEFAULT_VOICE_SPEED,
  getAgentLanguageLabel,
  getVoiceSpeedLabel,
  normalizeVoiceSpeed,
  VOICE_SPEED_OPTIONS,
} from "@/lib/constants/agent-config";
import {
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/modules/voices/voices-constants";
import {
  resolveVoicePreviewUrl,
  stopVoiceRingtone,
} from "@/modules/voices/voice-playback";
import { filtersToVoicesParams, listVoices } from "@/modules/voices/api";
import { VoicesPagination } from "@/modules/voices/voices-pagination";
import { cn } from "@/lib/utils";
import type { VoiceGenderFilter, VoiceProfile } from "@/types/voice";
import type { PaginatedMeta } from "@/types";

const PAGE_SIZE = 8;

const GENDER_FILTERS: { value: VoiceGenderFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "masculine", label: "Male" },
  { value: "feminine", label: "Female" },
  { value: "neutral", label: "Neutral" },
];

const PREVIEW_SELECTOR = "audio[data-voice-picker-preview]";

/** Only one preview should ever be audible — also silences the shared player. */
function pauseAllPickerAudio(except?: HTMLAudioElement) {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLAudioElement>(PREVIEW_SELECTOR)
    .forEach((audio) => {
      if (audio !== except) audio.pause();
    });
}

function formatAudioTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface VoicePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  provider: string;
  selectedVoice?: string;
  /** Speaking rate saved on the survey — also used for the previews here */
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  onSelect: (voice: VoiceProfile | null) => void;
}

export function VoicePickerDialog({
  open,
  onOpenChange,
  language,
  provider,
  selectedVoice,
  speed = DEFAULT_VOICE_SPEED,
  onSpeedChange,
  onSelect,
}: VoicePickerDialogProps) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<VoiceGenderFilter>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const sourceOk = provider === "google" || provider === "elevenlabs";
  const source = sourceOk ? provider : "";

  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const filterKey = `${debouncedSearch}|${gender}|${language}|${source}`;
  const prevFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    if (!open || !sourceOk) {
      setVoices([]);
      setMeta(null);
      return;
    }

    const filtersChanged = prevFilterKeyRef.current !== filterKey;
    if (filtersChanged) {
      prevFilterKeyRef.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    let cancelled = false;
    const firstLoad = voices.length === 0;
    if (firstLoad) setIsLoading(true);
    else setIsFetching(true);

    (async () => {
      try {
        // API: listVoices() → GET /api/voices
        const result = await listVoices(
          filtersToVoicesParams(
            {
              search: debouncedSearch,
              voiceType: "all",
              gender,
              language: language || "",
              source,
            },
            page,
            PAGE_SIZE
          )
        );
        if (!cancelled) {
          setVoices(result.data);
          setMeta(result.meta);
          setPage(result.meta.page);
        }
      } catch {
        if (!cancelled) {
          setVoices([]);
          setMeta(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceOk, filterKey, page]);

  const activeSpeed = normalizeVoiceSpeed(speed);

  useEffect(() => {
    if (!open) {
      stopVoiceRingtone();
      pauseAllPickerAudio();
    }
  }, [open]);

  const handleReset = () => {
    setSearch("");
    setGender("all");
    setPage(1);
  };

  const providerLabel =
    provider === "elevenlabs"
      ? "ElevenLabs"
      : provider === "google"
        ? "Google"
        : provider;

  const langLabel = getAgentLanguageLabel(language) || language || "—";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) stopVoiceRingtone();
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:rounded-[14px] [&>button]:text-white [&>button]:hover:text-white">
        {/* Hero header */}
        <DialogHeader className="relative isolate shrink-0 px-6 pb-6 pt-6 text-left text-white sm:rounded-t-[14px]">
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden brand-gradient sm:rounded-t-[14px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden opacity-30 sm:rounded-t-[14px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.2), transparent 36%)",
            }}
          />
          <WaveformDecor />
          <div className="relative z-10 flex items-start justify-between gap-4 pr-10">
            <div className="min-w-0 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                <Sparkles className="size-3" />
                Voice library
              </div>
              <DialogTitle className="font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[1.7rem]">
                Find your agent voice
              </DialogTitle>
              <p className="max-w-lg text-sm leading-relaxed text-white/80">
                Listening first? Tap preview. Ready? Choose — filtered for{" "}
                <span className="font-semibold text-white">{langLabel}</span> on{" "}
                <span className="font-semibold text-white">{providerLabel}</span>.
              </p>
            </div>
            <div className="hidden shrink-0 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-right backdrop-blur-sm sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                Matching
              </p>
              <p className="text-lg font-semibold tabular-nums text-white">
                {meta?.total ?? "—"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="shrink-0 space-y-3 border-b border-border/50 bg-card px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, accent, tone…"
              className="h-11 rounded-[10px] border-border/60 bg-muted/30 pl-10 text-sm shadow-none focus-visible:bg-card"
              aria-label="Search voices"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-[10px] border border-border/50 bg-muted/25 p-1">
              {GENDER_FILTERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-xs font-medium transition-all",
                    gender === g.value
                      ? "brand-gradient text-brand-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  )}
                >
                  {g.value !== "all" && (
                    <GenderIcon gender={g.value} className="size-3.5" />
                  )}
                  {g.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-8 gap-1.5 rounded-[8px] text-xs text-muted-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>

            <span className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border/50 bg-muted/25 px-2.5 text-[11px] font-semibold text-muted-foreground sm:ml-auto">
              <Gauge className="size-3.5 text-brand" />
              Speed
              <span className="tabular-nums text-brand">
                {getVoiceSpeedLabel(activeSpeed)}
              </span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Select a speed from 0.7x to 1.2x on any voice card. The selected
            speed is used for previews and saved with the survey.
          </p>
        </div>

        {/* Grid */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-6 py-5 pb-6",
            "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--brand)_7%,transparent),transparent_55%)]",
            isFetching && "opacity-75"
          )}
        >
          {!sourceOk ? (
            <EmptyState message="Choose Google or ElevenLabs as the TTS provider." />
          ) : isLoading ? (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-[12px]" />
              ))}
            </div>
          ) : voices.length === 0 ? (
            <EmptyState message="No voices for this language and provider. Try another filter." />
          ) : (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {voices.map((voice, i) => {
                const isSelected =
                  voice.id === selectedVoice ||
                  voice.name === selectedVoice ||
                  voice.voiceId === selectedVoice;

                return (
                  <PickerVoiceCard
                    key={voice.id}
                    voice={voice}
                    index={i}
                    selected={isSelected}
                    speed={activeSpeed}
                    onSpeedChange={onSpeedChange}
                    onSelect={() => {
                      if (isSelected) {
                        onSelect(null);
                        return;
                      }
                      pauseAllPickerAudio();
                      onSelect(voice);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/50 bg-card px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          {meta && meta.total > 0 ? (
            <VoicesPagination
              meta={meta}
              onPageChange={setPage}
            />
          ) : (
            <div />
          )}
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px] sm:ml-auto"
            onClick={() => {
              stopVoiceRingtone();
              onOpenChange(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WaveformDecor() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 h-24 w-64 translate-x-4 opacity-25"
      viewBox="0 0 240 80"
      fill="none"
    >
      {Array.from({ length: 28 }).map((_, i) => {
        const h = 10 + ((i * 17) % 48);
        return (
          <rect
            key={i}
            x={i * 8.5}
            y={40 - h / 2}
            width="3.5"
            height={h}
            rx="1.75"
            fill="white"
          />
        );
      })}
    </svg>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border/70 bg-card/80 py-20 text-center shadow-sm">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full brand-gradient text-brand-foreground shadow-brand">
        <Volume2 className="size-6" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function AvatarTone({
  name,
  gender,
  playing,
}: {
  name: string;
  gender: VoiceProfile["gender"];
  playing: boolean;
}) {
  const initial = (name.trim()[0] || "?").toUpperCase();
  const tone =
    gender === "feminine"
      ? "from-pink-400/90 to-rose-500/80"
      : gender === "masculine"
        ? "from-sky-400/90 to-brand"
        : "from-slate-400/90 to-slate-600/80";

  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center">
      {playing && (
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
      )}
      <span
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white shadow-md ring-2 ring-white/80 dark:ring-background",
          tone
        )}
      >
        {playing ? <Pause className="size-4" /> : initial}
      </span>
    </span>
  );
}

function PickerVoiceCard({
  voice,
  index,
  selected,
  speed,
  onSpeedChange,
  onSelect,
}: {
  voice: VoiceProfile;
  index: number;
  selected: boolean;
  speed: number;
  onSpeedChange?: (speed: number) => void;
  onSelect: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];

  useEffect(() => {
    const el = audioRef.current;
    if (el && el.playbackRate !== speed) el.playbackRate = speed;
  }, [speed]);

  const handleListen = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04, duration: 0.28 }}
      className={cn(
        "group relative flex flex-col rounded-[12px] border bg-card p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-brand/55 shadow-brand ring-1 ring-brand/25"
          : "border-border/45 hover:border-brand/30"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 size-28 rounded-full blur-2xl transition-opacity",
          selected || isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-70",
          voice.gender === "feminine"
            ? "bg-pink-400/25"
            : voice.gender === "masculine"
              ? "bg-sky-400/25"
              : "bg-slate-400/20"
        )}
      />

      <div className="relative flex gap-3">
        <button
          type="button"
          onClick={handleListen}
          className="shrink-0 self-start"
          aria-label={
            isPlaying ? `Pause ${voice.name}` : `Listen to ${voice.name}`
          }
          title="Listen"
        >
          <AvatarTone
            name={voice.name}
            gender={voice.gender}
            playing={isPlaying}
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 flex-1 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
              {voice.name}
            </h3>
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
                selected
                  ? "bg-brand text-brand-foreground"
                  : "border border-border/60 bg-transparent text-transparent"
              )}
              aria-hidden
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                genderStyle.className
              )}
            >
              <GenderIcon gender={voice.gender} className="size-3" />
              {genderStyle.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                providerStyle.className
              )}
            >
              {providerStyle.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {voice.languageLabel || voice.language}
            </span>
          </div>

          <p
            className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground"
            title={voice.description || `${voice.name} voice sample`}
          >
            {voice.description || `${voice.name} voice sample`}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex shrink-0 flex-col gap-2">
        <audio
          ref={audioRef}
          preload="metadata"
          src={resolveVoicePreviewUrl(voice.previewUrl)}
          data-voice-picker-preview
          aria-label={`Preview ${voice.name}`}
          onPlay={(e) => {
            stopVoiceRingtone();
            pauseAllPickerAudio(e.currentTarget);
            e.currentTarget.playbackRate = speed;
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        >
          Your browser does not support audio playback.
        </audio>

        <div className="space-y-2 rounded-[12px] border border-border/60 bg-muted/35 p-2.5 shadow-inner">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleListen}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
              aria-label={isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`}
            >
              {isPlaying ? (
                <Pause className="size-3.5 fill-current" />
              ) : (
                <Play className="ml-0.5 size-3.5 fill-current" />
              )}
            </button>

            <span className="w-17.5 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
              {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = next;
                setCurrentTime(next);
              }}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-foreground"
              aria-label={`Seek ${voice.name} preview`}
            />

            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                if (audioRef.current) audioRef.current.muted = next;
                setIsMuted(next);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-background/70"
              aria-label={isMuted ? "Unmute preview" : "Mute preview"}
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 border-t border-border/50 pt-2">
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Gauge className="size-3.5 text-brand" />
              Playback speed
            </span>
            <div className="min-w-0 flex-1">
              <Select
                value={String(speed)}
                options={[...VOICE_SPEED_OPTIONS]}
                onChange={(e) => {
                  const rate = normalizeVoiceSpeed(e.target.value);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                  onSpeedChange?.(rate);
                }}
                className="h-8 rounded-[8px] bg-card text-xs"
                aria-label={`Playback speed for ${voice.name}`}
              />
            </div>
          </div>
        </div>

        <Button
            type="button"
            size="sm"
            variant={selected ? "outline" : "default"}
            className={cn(
              "h-9 w-full rounded-[10px] text-xs font-medium",
              selected &&
                "border-brand/45 bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
            )}
            onClick={onSelect}
          >
            {selected ? "Unselect" : "Choose"}
        </Button>
      </div>
    </motion.article>
  );
}
