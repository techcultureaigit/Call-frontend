"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  AudioLines,
  Check,
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  Search,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { GenderIcon } from "@/modules/voices/gender-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks";
import {
  DEFAULT_VOICE_SPEED,
  getAgentLanguageLabel,
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
import {
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEAD_ROW_CLASS,
} from "@/components/shared/table-column-layout";
import { cn } from "@/lib/utils";
import type { VoiceGenderFilter, VoiceProfile } from "@/types/voice";
import type { PaginatedMeta } from "@/types";

const PAGE_SIZE = 10;
const WAVEFORM_BARS = 32;

const GENDER_FILTERS: { value: VoiceGenderFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "masculine", label: "Male" },
  { value: "feminine", label: "Female" },
  { value: "neutral", label: "Neutral" },
];

const PREVIEW_SELECTOR = "audio[data-voice-picker-preview]";

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

function formatSpeedLabel(speed: number) {
  return `${speed.toFixed(1)}x`;
}

function voiceWaveform(seed: string, count = WAVEFORM_BARS): number[] {
  let n = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    n ^= seed.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i += 1) {
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    bars.push(5 + (Math.abs(n) % 19));
  }
  return bars;
}

interface VoicePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  provider: string;
  selectedVoice?: string;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  onSelect: (voice: VoiceProfile | null, speed?: number) => void;
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

  const handleClose = () => {
    stopVoiceRingtone();
    onOpenChange(false);
  };

  const providerLabel =
    provider === "elevenlabs"
      ? "ElevenLabs"
      : provider === "google"
        ? "Google"
        : provider;

  const langLabel = getAgentLanguageLabel(language) || language || "—";
  const filtersDirty = search.trim() !== "" || gender !== "all";

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) stopVoiceRingtone();
        onOpenChange(next);
      }}
      className="sm:max-w-3xl md:max-w-5xl lg:max-w-6xl"
    >
      <SheetHeader
        onClose={handleClose}
        className="relative overflow-hidden border-b border-border/50 bg-card py-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-mesh opacity-50"
        />
        <div className="relative flex items-start gap-3.5 pr-2">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[6px] brand-gradient text-brand-foreground shadow-brand">
            <AudioLines className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Agent voice
                </p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">
                  Voice library
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Preview a sample, set speed on the row, then choose a voice.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {langLabel}
                </span>
                <span className="inline-flex items-center rounded-[6px] border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground">
                  {providerLabel}
                </span>
                <span className="inline-flex items-center rounded-[6px] border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary">
                  {meta?.total ?? "—"} voices
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="shrink-0 border-b border-border/50 bg-card px-6 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tone, or style…"
              className="h-10 rounded-[6px] border-border/60 bg-background pl-10 shadow-subtle"
              aria-label="Search voices"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-10 items-center rounded-[6px] border border-border/60 bg-muted/35 p-1">
              {GENDER_FILTERS.map((g) => {
                const active = gender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-xs font-medium transition-all",
                      active
                        ? "bg-card text-foreground shadow-subtle"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g.value === "all" ? (
                      <Users className="size-3.5" />
                    ) : (
                      <GenderIcon gender={g.value} className="size-3.5" />
                    )}
                    {g.label}
                  </button>
                );
              })}
            </div>

            {filtersDirty && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 gap-1.5 rounded-[6px] px-2.5 text-xs text-muted-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <SheetContent
        className={cn(
          "min-h-0 bg-muted/20 px-0 py-0",
          isFetching && "opacity-70"
        )}
      >
        {!sourceOk ? (
          <EmptyState message="Choose Google or ElevenLabs as the TTS provider." />
        ) : isLoading ? (
          <div className="space-y-2 px-5 py-5 sm:px-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[6px]" />
            ))}
          </div>
        ) : voices.length === 0 ? (
          <EmptyState message="No voices for this language and provider. Try another filter." />
        ) : (
          <div className="h-full overflow-auto px-4 py-4 scrollbar-thin sm:px-6">
            <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr
                    className={cn(
                      TABLE_HEAD_ROW_CLASS,
                      "bg-card/95 backdrop-blur-sm"
                    )}
                  >
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "w-[26%] pl-4")}>
                      Voice
                    </th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "w-[12%]")}>
                      Gender
                    </th>
                    <th className={cn(TABLE_HEAD_CELL_CLASS, "w-[46%]")}>
                      Preview
                    </th>
                    <th
                      className={cn(
                        TABLE_HEAD_CELL_CLASS,
                        "w-[16%] pr-4 text-right"
                      )}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {voices.map((voice) => {
                    const isSelected =
                      voice.id === selectedVoice ||
                      voice.name === selectedVoice ||
                      voice.voiceId === selectedVoice;

                    return (
                      <PickerVoiceRow
                        key={voice.id}
                        voice={voice}
                        selected={isSelected}
                        initialSpeed={
                          isSelected ? activeSpeed : DEFAULT_VOICE_SPEED
                        }
                        onSpeedChange={onSpeedChange}
                        onSelect={(rowSpeed) => {
                          if (isSelected) {
                            onSelect(null);
                            return;
                          }
                          pauseAllPickerAudio();
                          onSelect(voice, rowSpeed);
                        }}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SheetContent>

      <SheetFooter className="flex flex-col gap-3 border-t border-border/50 bg-card sm:flex-row sm:items-center sm:justify-between">
        {meta && meta.total > 0 ? (
          <VoicesPagination meta={meta} onPageChange={setPage} />
        ) : (
          <div />
        )}
        <Button
          type="button"
          className="min-w-28 rounded-[6px] sm:ml-auto"
          onClick={handleClose}
        >
          Done
        </Button>
      </SheetFooter>
    </Sheet>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="relative flex h-full min-h-72 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-mesh opacity-50"
      />
      <span className="relative mb-4 flex size-14 items-center justify-center rounded-[6px] border border-border/60 bg-card text-primary shadow-elevated">
        <AudioLines className="size-6" />
      </span>
      <p className="relative max-w-xs text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

function SpeedDropdown({
  speed,
  voiceName,
  onChange,
}: {
  speed: number;
  voiceName: string;
  onChange: (speed: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[6px] border border-border/60 bg-background px-2 text-[11px] font-semibold tabular-nums text-foreground shadow-subtle transition-colors hover:border-primary/35 hover:bg-muted/50"
          aria-label={`Playback speed for ${voiceName}`}
        >
          {formatSpeedLabel(speed)}
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-80 min-w-28 p-1"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
          Speed
        </DropdownMenuLabel>
        {VOICE_SPEED_OPTIONS.map((option) => {
          const value = Number(option.value);
          const active = speed === value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(normalizeVoiceSpeed(value))}
              className={cn(
                "cursor-pointer justify-between rounded-[5px] text-xs font-medium",
                active && "bg-primary/10 text-primary focus:bg-primary/12 focus:text-primary"
              )}
            >
              {formatSpeedLabel(value)}
              {active ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PickerVoiceRow({
  voice,
  selected,
  initialSpeed,
  onSpeedChange,
  onSelect,
}: {
  voice: VoiceProfile;
  selected: boolean;
  initialSpeed: number;
  onSpeedChange?: (speed: number) => void;
  onSelect: (speed: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [rowSpeed, setRowSpeed] = useState(() =>
    normalizeVoiceSpeed(initialSpeed)
  );
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const initial = (voice.name.trim()[0] || "?").toUpperCase();
  const bars = useMemo(
    () => voiceWaveform(voice.id || voice.name),
    [voice.id, voice.name]
  );
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const el = audioRef.current;
    if (el && el.playbackRate !== rowSpeed) el.playbackRate = rowSpeed;
  }, [rowSpeed]);

  const applySpeed = (next: number) => {
    const rate = normalizeVoiceSpeed(next);
    setRowSpeed(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
    if (selected) onSpeedChange?.(rate);
  };

  const togglePlay = (e?: MouseEvent) => {
    e?.stopPropagation();
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <tr
      className={cn(
        TABLE_BODY_ROW_CLASS,
        selected && "bg-primary/5 hover:bg-primary/8",
        isPlaying && !selected && "bg-primary/4"
      )}
    >
      <td className={cn(TABLE_BODY_CELL_CLASS, "relative max-w-0 py-3 pl-4")}>
        {selected && (
          <span
            aria-hidden
            className="absolute inset-y-2.5 left-0 w-0.75 rounded-r-full brand-gradient"
          />
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-subtle",
              voice.gender === "feminine" &&
                "bg-linear-to-br from-pink-400 to-rose-500",
              voice.gender === "masculine" &&
                "bg-linear-to-br from-sky-400 to-primary",
              voice.gender === "neutral" &&
                "bg-linear-to-br from-slate-400 to-slate-600"
            )}
            aria-label={
              isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`
            }
          >
            {isPlaying ? <Pause className="size-3.5 fill-current" /> : initial}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                className="truncate font-semibold tracking-tight text-foreground"
                title={voice.name}
              >
                {voice.name}
              </p>
              {selected && (
                <Check
                  className="size-3.5 shrink-0 text-primary"
                  strokeWidth={2.5}
                />
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {voice.languageLabel || voice.language} · {providerStyle.label}
            </p>
          </div>
        </div>
      </td>

      <td className={cn(TABLE_BODY_CELL_CLASS, "py-3")}>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11px] font-medium",
            genderStyle.className
          )}
        >
          <GenderIcon gender={voice.gender} className="size-3" />
          {genderStyle.label}
        </span>
      </td>

      <td className={cn(TABLE_BODY_CELL_CLASS, "py-3")}>
        <audio
          ref={audioRef}
          preload="metadata"
          src={resolveVoicePreviewUrl(voice.previewUrl)}
          data-voice-picker-preview
          aria-label={`Preview ${voice.name}`}
          onPlay={(e) => {
            stopVoiceRingtone();
            pauseAllPickerAudio(e.currentTarget);
            e.currentTarget.playbackRate = rowSpeed;
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

        <div
          className={cn(
            "flex items-center gap-2 rounded-[6px] border px-2 py-1.5",
            isPlaying
              ? "border-primary/30 bg-primary/5"
              : "border-border/50 bg-muted/25"
          )}
        >
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full transition-all",
              isPlaying
                ? "brand-gradient text-brand-foreground shadow-brand"
                : "bg-foreground text-background hover:opacity-90"
            )}
            aria-label={
              isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`
            }
          >
            {isPlaying ? (
              <Pause className="size-3 fill-current" />
            ) : (
              <Play className="ml-px size-3 fill-current" />
            )}
          </button>

          <div className="relative flex h-6 min-w-0 flex-1 items-center">
            <div className="flex h-full w-full items-center gap-px">
              {bars.map((height, i) => {
                const filled =
                  i <= Math.round((progress / 100) * (bars.length - 1));
                return (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      "w-0.75 min-w-px flex-1 rounded-full",
                      isPlaying && filled && "voice-eq-bar bg-primary",
                      isPlaying && !filled && "bg-primary/25",
                      !isPlaying && filled && "bg-primary/80",
                      !isPlaying && !filled && "bg-foreground/18"
                    )}
                    style={{
                      height: `${Math.max(4, height - 4)}px`,
                      animationDelay: `${(i % 8) * 0.07}s`,
                    }}
                  />
                );
              })}
            </div>
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
              className="voice-seek-overlay absolute inset-0 h-full w-full cursor-pointer"
              aria-label={`Seek ${voice.name} preview`}
            />
          </div>

          <span className="hidden w-16 shrink-0 text-right text-[10px] font-medium tabular-nums text-muted-foreground sm:block">
            {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
          </span>

          <SpeedDropdown
            speed={rowSpeed}
            voiceName={voice.name}
            onChange={applySpeed}
          />

          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              if (audioRef.current) audioRef.current.muted = next;
              setIsMuted(next);
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={isMuted ? "Unmute preview" : "Mute preview"}
          >
            {isMuted ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </button>
        </div>
      </td>

      <td className={cn(TABLE_BODY_CELL_CLASS, "py-3 pr-4 text-right")}>
        <Button
          type="button"
          size="sm"
          variant={selected ? "outline" : "default"}
          className={cn(
            "h-8 min-w-20 rounded-[6px]",
            selected &&
              "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          )}
          onClick={() => onSelect(rowSpeed)}
        >
          {selected ? (
            <span className="inline-flex items-center gap-1">
              <Check className="size-3.5" strokeWidth={2.5} />
              Selected
            </span>
          ) : (
            "Choose"
          )}
        </Button>
      </td>
    </tr>
  );
}
