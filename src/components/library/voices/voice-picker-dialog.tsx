"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Pause,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
} from "lucide-react";
import { GenderIcon } from "@/components/library/voices/gender-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, useVoices } from "@/hooks";
import { getAgentLanguageLabel } from "@/lib/constants/agent-config";
import {
  VOICE_GENDER_STYLES,
  VOICE_PROVIDER_STYLES,
} from "@/lib/constants/voices";
import {
  getPlayingVoiceId,
  stopVoiceRingtone,
  subscribeVoicePlayback,
  toggleVoiceRingtone,
} from "@/lib/voice-playback";
import { cn } from "@/lib/utils";
import type { VoiceGenderFilter, VoiceProfile } from "@/types/voice";

const PAGE_SIZE = 8;

const GENDER_FILTERS: { value: VoiceGenderFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "masculine", label: "Male" },
  { value: "feminine", label: "Female" },
  { value: "neutral", label: "Neutral" },
];

interface VoicePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  provider: string;
  selectedVoice?: string;
  onSelect: (voice: VoiceProfile | null) => void;
}

export function VoicePickerDialog({
  open,
  onOpenChange,
  language,
  provider,
  selectedVoice,
  onSelect,
}: VoicePickerDialogProps) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<VoiceGenderFilter>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const sourceOk = provider === "google" || provider === "elevenlabs";
  const source = sourceOk ? provider : "";

  const { data, isLoading, isFetching } = useVoices(
    {
      search: debouncedSearch,
      voiceType: "all",
      gender,
      language: language || "",
      source,
    },
    page,
    PAGE_SIZE,
    { enabled: open && sourceOk }
  );

  const voices = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  useEffect(() => {
    if (!open) {
      stopVoiceRingtone();
      setSearch("");
      setGender("all");
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, gender, language, provider]);

  const handleReset = () => {
    setSearch("");
    setGender("all");
    setPage(1);
  };

  const pageButtons = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => i + 1
  );

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
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:rounded-[14px]">
        {/* Hero header */}
        <DialogHeader className="relative isolate overflow-hidden px-6 pb-5 pt-6 text-left text-white">
          <div
            aria-hidden
            className="absolute inset-0 brand-gradient"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.2), transparent 36%)",
            }}
          />
          <WaveformDecor />
          <div className="relative z-10 flex items-start justify-between gap-4 pr-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                <Sparkles className="size-3" />
                Voice library
              </div>
              <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.7rem]">
                Find your agent voice
              </DialogTitle>
              <p className="max-w-md text-sm text-white/80">
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
        <div className="space-y-3 border-b border-border/50 bg-card px-6 py-4">
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
          </div>
        </div>

        {/* Grid */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-6 py-5",
            "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--brand)_7%,transparent),transparent_55%)]",
            isFetching && "opacity-75"
          )}
        >
          {!sourceOk ? (
            <EmptyState message="Choose Google or ElevenLabs as the TTS provider." />
          ) : isLoading ? (
            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-[12px]" />
              ))}
            </div>
          ) : voices.length === 0 ? (
            <EmptyState message="No voices for this language and provider. Try another filter." />
          ) : (
            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              {voices.map((voice, i) => {
                const isSelected =
                  voice.name === selectedVoice ||
                  voice.voiceId === selectedVoice;

                return (
                  <PickerVoiceCard
                    key={voice.id}
                    voice={voice}
                    index={i}
                    selected={isSelected}
                    onSelect={() => {
                      if (isSelected) {
                        onSelect(null);
                        return;
                      }
                      stopVoiceRingtone();
                      onSelect(voice);
                      onOpenChange(false);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-3 border-t border-border/50 bg-card px-6 py-3.5 sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {totalPages > 1 &&
              pageButtons.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={p === page ? "default" : "ghost"}
                  className="size-8 rounded-[8px] p-0 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            {meta && meta.total > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
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
  onSelect,
}: {
  voice: VoiceProfile;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [playingId, setPlayingId] = useState<string | null>(getPlayingVoiceId);
  const isPlaying = playingId === voice.id;
  const providerStyle = VOICE_PROVIDER_STYLES[voice.provider];
  const genderStyle = VOICE_GENDER_STYLES[voice.gender];

  useEffect(() => subscribeVoicePlayback(setPlayingId), []);

  const handleListen = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleVoiceRingtone(voice.id, voice.previewUrl);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04, duration: 0.28 }}
      className={cn(
        "group relative flex h-full min-h-40 flex-col overflow-hidden rounded-[12px] border bg-card/95 p-4 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md",
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

      <div className="relative flex flex-1 gap-3">
        <button
          type="button"
          onClick={handleListen}
          className="shrink-0"
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
            <h3 className="line-clamp-1 flex-1 text-[15px] font-semibold tracking-tight text-foreground">
              {voice.name}
            </h3>
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
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

          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {voice.description || `${voice.name} voice sample`}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "h-9 flex-1 rounded-[10px] text-xs font-medium",
            isPlaying && "border-brand/40 bg-brand/10 text-brand"
          )}
          onClick={handleListen}
        >
          {isPlaying ? (
            <>
              <Pause className="size-3.5" />
              Playing…
            </>
          ) : (
            <>
              <Volume2 className="size-3.5" />
              Listen
            </>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={selected ? "outline" : "default"}
          className={cn(
            "h-9 w-28 shrink-0 rounded-[10px] text-xs font-medium",
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
