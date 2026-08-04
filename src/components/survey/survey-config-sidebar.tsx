"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Maximize2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoiceStatus = "idle" | "connecting" | "listening" | "speaking";

interface VoiceClip {
  id: string;
  durationMs: number;
  role: "user" | "agent";
}

interface SurveyConfigSidebarProps {
  agentName: string;
}

const BAR_COUNT = 16;

function randomLevels(active: boolean, intensity = 1) {
  if (!active) return Array.from({ length: BAR_COUNT }, () => 0.08);
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const wave = 0.25 + Math.sin(Date.now() / 180 + i * 0.55) * 0.2;
    const noise = Math.random() * 0.45;
    return Math.max(0.1, Math.min(1, (wave + noise) * intensity));
  });
}

export function SurveyConfigSidebar({ agentName }: SurveyConfigSidebarProps) {
  const [isActive, setIsActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0.08)
  );
  const [elapsed, setElapsed] = useState(0);
  const [clips, setClips] = useState<VoiceClip[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutedRef = useRef(false);
  const statusRef = useRef<VoiceStatus>("idle");

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (meterRef.current) {
      clearInterval(meterRef.current);
      meterRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const setVoiceStatus = (next: VoiceStatus) => {
    statusRef.current = next;
    setStatus(next);
  };

  const startMeter = () => {
    if (meterRef.current) clearInterval(meterRef.current);
    meterRef.current = setInterval(() => {
      const speaking = statusRef.current === "speaking";
      const listening =
        statusRef.current === "listening" && !mutedRef.current;
      if (speaking) setLevels(randomLevels(true, 0.85));
      else if (listening) setLevels(randomLevels(true, 1));
      else setLevels(Array.from({ length: BAR_COUNT }, () => 0.08));
    }, 80);
  };

  const runDemoCycle = () => {
    setVoiceStatus("listening");
    // User "speaks" then agent replies — dummy voice flow
    schedule(() => {
      if (mutedRef.current) {
        runDemoCycle();
        return;
      }
      setClips((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          durationMs: 1800 + Math.round(Math.random() * 1200),
          role: "user",
        },
      ]);
      setVoiceStatus("speaking");
      schedule(() => {
        setClips((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            durationMs: 1400 + Math.round(Math.random() * 1000),
            role: "agent",
          },
        ]);
        if (!mutedRef.current) setVoiceStatus("listening");
        schedule(runDemoCycle, 1600);
      }, 2200);
    }, 2800);
  };

  const handleStart = () => {
    clearTimers();
    setClips([]);
    setElapsed(0);
    setMuted(false);
    mutedRef.current = false;
    setIsActive(true);
    setVoiceStatus("connecting");
    toast.success("Voice session started");

    schedule(() => {
      setVoiceStatus("listening");
      startMeter();
      intervalRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
      runDemoCycle();
    }, 600);
  };

  const handleEnd = () => {
    clearTimers();
    setIsActive(false);
    setMuted(false);
    mutedRef.current = false;
    setVoiceStatus("idle");
    setLevels(Array.from({ length: BAR_COUNT }, () => 0.08));
    toast.message("Voice session ended");
  };

  const toggleMute = () => {
    if (!isActive) return;
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      return next;
    });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatClip = (ms: number) =>
    `${Math.max(1, Math.round(ms / 1000))}s`;

  const statusLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "speaking"
        ? "Agent speaking"
        : status === "listening"
          ? muted
            ? "Mic muted"
            : "Listening…"
          : "Ready for voice test";

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <div className="flex flex-col overflow-hidden rounded-[6px] border border-border/70 bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/15">
              <Mic className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Voice</p>
              <p className="text-[11px] text-muted-foreground">
                Live voice preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                {formatTime(elapsed)}
              </span>
            )}
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Expand"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[340px] flex-1 flex-col bg-dotted">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
            <div className="relative mb-5">
              {isActive && status === "listening" && !muted && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
                  <span className="absolute -inset-3 animate-pulse rounded-full bg-brand/10" />
                </>
              )}
              {isActive && status === "speaking" && (
                <span className="absolute -inset-3 animate-pulse rounded-full bg-emerald-500/15" />
              )}
              <div
                className={cn(
                  "relative flex size-20 items-center justify-center rounded-full border bg-card shadow-elevated transition-colors",
                  isActive
                    ? status === "speaking"
                      ? "border-emerald-500/40 text-emerald-600"
                      : "border-brand/40 text-brand"
                    : "border-border/70 text-brand/70"
                )}
              >
                {status === "speaking" ? (
                  <Volume2 className="size-9" />
                ) : (
                  <Mic className="size-9" />
                )}
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground">
              {agentName || "Your agent"}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              {isActive && (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    status === "speaking"
                      ? "bg-emerald-500"
                      : muted
                        ? "bg-amber-500"
                        : "animate-pulse bg-brand"
                  )}
                />
              )}
              {statusLabel}
            </p>

            <div className="mt-6 flex h-12 items-end justify-center gap-1">
              {levels.map((level, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 rounded-full transition-[height] duration-75",
                    isActive && (status === "speaking" || !muted)
                      ? "bg-brand"
                      : "bg-border"
                  )}
                  style={{ height: `${Math.round(level * 48)}px` }}
                />
              ))}
            </div>

            {!isActive && (
              <p className="mt-4 max-w-[220px] text-xs text-muted-foreground">
                Start a demo voice call to preview how your agent will sound.
              </p>
            )}

            {clips.length > 0 && (
              <div className="mt-5 w-full max-w-[240px] space-y-2 text-left">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Voice clips
                </p>
                {clips.slice(-4).map((clip) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center gap-2 rounded-[6px] border px-2.5 py-2",
                      clip.role === "user"
                        ? "border-brand/25 bg-brand/5"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        clip.role === "user"
                          ? "bg-brand text-brand-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {clip.role === "user" ? (
                        <Mic className="size-3.5" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-foreground">
                        {clip.role === "user" ? "Your voice" : "Agent voice"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex h-3 flex-1 items-end gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "w-0.5 rounded-full",
                                clip.role === "user"
                                  ? "bg-brand/70"
                                  : "bg-muted-foreground/50"
                              )}
                              style={{
                                height: `${4 + ((i * 5 + clip.durationMs) % 8)}px`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatClip(clip.durationMs)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border/50 bg-card/80 p-4 backdrop-blur">
            {isActive ? (
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={toggleMute}
                  className={cn(
                    "size-12 rounded-full",
                    muted &&
                      "border-amber-500/40 bg-amber-500/10 text-amber-700"
                  )}
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                >
                  {muted ? (
                    <MicOff className="size-5" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleEnd}
                  className="size-12 rounded-full bg-red-600 text-white hover:bg-red-700"
                  aria-label="End voice call"
                >
                  <PhoneOff className="size-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleStart} className="w-full">
                <Phone className="size-4" />
                Start voice call
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
