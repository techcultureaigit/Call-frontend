"use client";

/**
 * survey-form.tsx
 * Create / edit survey form.
 * Route: /survey/new, /survey/[id]/configure
 *
 * API calls in this file:
 *   getSurvey()  → GET  /api/surveys/:id   (edit — via survey-by-id loader)
 *   saveSurvey() → POST /api/surveys
 */

import { saveSurvey, unscheduleSurvey } from "./api";
import { computeSurveyProgress, isSurveyReadyToSchedule, isSurveyCompleted } from "./survey-lib";
import type { SurveyDisplayStatus } from "./survey-lib";
import {
  SurveyStatusBadge,
  createEmptyScheduleForm,
  parseScheduleForm,
  scheduleToFormValues,
} from "./survey-dialogs";
import type { ScheduleFormValues } from "./survey-dialogs";
import { PersonaTab, PromptsTab, SurveyQuestionsTab, FarewellTab, ClientContactTab, ScheduleTab } from "./survey-tabs";
import { PageContainer } from "@/components/layout";
import { AppLoaderSpinner, AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { usePageMeta, usePermissions } from "@/hooks";
import { ENABLED_AGENT_CONFIG_TABS as ENABLED_SURVEY_CONFIG_TABS, isAgentConfigTabDisabled as isSurveyConfigTabDisabled, DEFAULT_AGENT_CONFIG as DEFAULT_SURVEY_CONFIG } from "@/lib/constants/agent-config";
import { cn } from "@/lib/utils";
import type { AgentConfigTab as SurveyConfigTab, Agent as Survey, AgentConfig as SurveyConfig } from "@/types/agent";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HelpCircle, PanelRightClose, PanelRightOpen, Brain, CalendarClock, Check, ClipboardList, GitBranch, List, MessageCircle, Monitor, User, Users, ArrowRight, Maximize2, Mic, MicOff, Phone, PhoneOff, Volume2, Bot, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

interface SurveyTopNavProps {
  surveyName?: string;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  status?: SurveyDisplayStatus;
}

export function SurveyTopNav({
  surveyName = "",
  previewOpen = false,
  onTogglePreview,
  status = "draft",
}: SurveyTopNavProps) {
  const title = surveyName.trim() || "Untitled survey";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Link
          href="/survey"
          className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-[6px] px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-lg border border-border/70 bg-card transition-colors group-hover:border-brand/40 group-hover:text-brand">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
          <span className="hidden sm:inline">Back to Surveys</span>
        </Link>

        <span
          aria-hidden
          className="hidden h-5 w-px shrink-0 bg-border/70 sm:block"
        />

        {/* Survey name — one line */}
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Survey
          </span>
          <h1
            className="truncate text-base font-semibold tracking-tight text-foreground"
            title={title}
          >
            <span className="border-b-2 border-brand/40 pb-0.5">{title}</span>
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onTogglePreview && (
          <button
            type="button"
            onClick={onTogglePreview}
            aria-pressed={previewOpen}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-[6px] border px-3 text-[13px] font-medium transition-colors",
              previewOpen
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border/70 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >
            {previewOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRightOpen className="size-4" />
            )}
            <span className="hidden sm:inline">
              {previewOpen ? "Hide preview" : "Show preview"}
            </span>
          </button>
        )}

        <SurveyStatusBadge status={status} size="md" withDot />
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </button>
      </div>
    </div>
  );
}

const TAB_ICONS: Record<SurveyConfigTab, LucideIcon> = {
  persona: User,
  prompts: List,
  "survey-questions": ClipboardList,
  farewell: MessageCircle,
  "client-contact": Users,
  schedule: CalendarClock,
  functions: GitBranch,
  wisdom: Brain,
  "post-call": Monitor,
};

interface SurveyConfigTabsProps {
  active: SurveyConfigTab;
  onChange: (tab: SurveyConfigTab) => void;
  completedTabs?: Partial<Record<SurveyConfigTab, boolean>>;
  invalidTabs?: Partial<Record<SurveyConfigTab, boolean>>;
}

export function SurveyConfigTabs({
  active,
  onChange,
  completedTabs = {},
  invalidTabs = {},
}: SurveyConfigTabsProps) {
  const visibleTabs = ENABLED_SURVEY_CONFIG_TABS;

  return (
    <nav aria-label="Survey configuration steps" className="w-full">
      <ol className="flex flex-col gap-1">
        {visibleTabs.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id as SurveyConfigTab];
          const isDisabled = isSurveyConfigTabDisabled(tab.id);
          const isActive = active === tab.id;
          const isDone = Boolean(completedTabs[tab.id as SurveyConfigTab]);
          const isInvalid = Boolean(invalidTabs[tab.id as SurveyConfigTab]);
          const isLast = index === visibleTabs.length - 1;

          return (
            <li key={tab.id} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => {
                  if (isDisabled) return;
                  onChange(tab.id as SurveyConfigTab);
                }}
                disabled={isDisabled}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isDisabled}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isDisabled && "cursor-not-allowed opacity-55",
                  !isDisabled && !isActive && "hover:bg-muted/60"
                )}
              >
                {isActive && !isDisabled && (
                  <motion.span
                    layoutId="survey-step-active-pill"
                    className="absolute inset-0 z-0 rounded-[6px] bg-brand/8 ring-1 ring-inset ring-brand/15"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                <span
                  className={cn(
                    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-[6px] text-sm font-semibold transition-all duration-300",
                    isActive &&
                      !isDisabled &&
                      "brand-gradient text-brand-foreground shadow-brand ring-2 ring-brand/20",
                    isDone &&
                      !isActive &&
                      "bg-brand/12 text-brand ring-1 ring-inset ring-brand/25",
                    isInvalid &&
                      !isActive &&
                      "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/25",
                    isDisabled &&
                      "bg-muted/70 text-muted-foreground/70 ring-1 ring-inset ring-border/70",
                    !isActive &&
                      !isDone &&
                      !isInvalid &&
                      !isDisabled &&
                      "bg-muted text-muted-foreground ring-1 ring-inset ring-border group-hover:text-foreground"
                  )}
                >
                  {isInvalid ? (
                    <AlertCircle className="size-4" />
                  ) : isDone && !isActive ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-[18px]" />
                  )}
                </span>

                <span className="relative z-10 min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                      isActive && !isDisabled
                        ? "text-brand"
                        : "text-muted-foreground/70"
                    )}
                  >
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 truncate text-sm font-semibold tracking-tight transition-colors",
                      isActive && !isDisabled
                        ? "text-foreground"
                        : isDone
                          ? "text-foreground/80"
                          : isDisabled
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{tab.label}</span>
                    {isInvalid ? (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-amber-500"
                        aria-label="Required fields missing"
                      />
                    ) : null}
                  </span>
                </span>
              </button>

              {!isLast && (
                <span className="ml-[1.4rem] my-0.5 h-4 w-px overflow-hidden rounded-full bg-border">
                  <motion.span
                    className="block w-full bg-brand"
                    initial={false}
                    animate={{ height: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface SurveyConfigFooterProps {
  onBack: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  step?: number;
  total?: number;
  /** When true on last step, CTA shows Save & Schedule */
  scheduleEnabled?: boolean;
}

export function SurveyConfigFooter({
  onBack,
  onNext,
  isFirst,
  isLast,
  isSaving,
  step = 1,
  total = 5,
  scheduleEnabled = false,
}: SurveyConfigFooterProps) {
  const pct = Math.round((step / total) * 100);

  return (
    <div className="mt-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="tabular-nums">
            Step <span className="text-foreground">{step}</span> of {total}
          </span>
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} disabled={isFirst}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isSaving} className="min-w-[160px]">
          {isSaving ? (
            <AppLoaderSpinner size="sm" />
          ) : isLast ? (
            <>
              <CalendarClock className="size-4" />
              {scheduleEnabled ? "Save & Schedule" : "Save survey"}
            </>
          ) : (
            <>
              Save &amp; Next
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type VoiceStatus = "idle" | "connecting" | "listening" | "speaking";

interface VoiceClip {
  id: string;
  durationMs: number;
  role: "user" | "survey";
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
    // User "speaks" then survey replies — dummy voice flow
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
            role: "survey",
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
        ? "Survey speaking"
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
              {agentName || "Your survey"}
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
                Start a demo voice call to preview how your survey will sound.
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
                        {clip.role === "user" ? "Your voice" : "Survey voice"}
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

const ENABLED_TAB_ORDER = ENABLED_SURVEY_CONFIG_TABS.map(
  (tab) => tab.id as SurveyConfigTab
);

type StepRequirementKey =
  | "identity"
  | "prompts"
  | "survey-questions"
  | "farewell"
  | "client-contact"
  | "schedule";

const TAB_REQUIRED_KEYS: Record<SurveyConfigTab, StepRequirementKey[]> = {
  persona: ["identity"],
  prompts: ["identity", "prompts"],
  "survey-questions": ["identity", "prompts", "survey-questions"],
  farewell: ["identity", "prompts", "survey-questions"],
  "client-contact": [
    "identity",
    "prompts",
    "survey-questions",
    "client-contact",
  ],
  schedule: ["identity", "prompts", "survey-questions", "client-contact"],
  wisdom: ["identity", "prompts", "survey-questions", "client-contact"],
  "post-call": ["identity", "prompts", "survey-questions", "client-contact"],
  functions: ["identity", "prompts", "survey-questions", "client-contact"],
};

const TAB_TO_PROGRESS_KEY: Partial<Record<SurveyConfigTab, StepRequirementKey>> = {
  persona: "identity",
  prompts: "prompts",
  "survey-questions": "survey-questions",
  farewell: "farewell",
  "client-contact": "client-contact",
  schedule: "schedule",
};

const PROGRESS_TO_TAB: Record<StepRequirementKey, SurveyConfigTab> = {
  identity: "persona",
  prompts: "prompts",
  "survey-questions": "survey-questions",
  farewell: "farewell",
  "client-contact": "client-contact",
  schedule: "schedule",
};

interface SurveyConfigureViewProps {
  survey?: Survey | null;
  isNew?: boolean;
}

export function SurveyCreateEditView({
  survey,
  isNew = false,
}: SurveyConfigureViewProps) {
  const router = useRouter();
  const { isReady, canCreateSurvey, canUpdateSurvey } = usePermissions();

  const baseConfig = useMemo(() => {
    return survey?.config
      ? structuredClone(survey.config)
      : structuredClone(DEFAULT_SURVEY_CONFIG);
  }, [survey]);

  const [activeTab, setActiveTab] = useState<SurveyConfigTab>(
    ENABLED_TAB_ORDER[0] ?? "persona"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [surveyId, setSurveyId] = useState(survey?.id);
  const [config, setConfig] = useState<SurveyConfig>(baseConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [schedulingStatus, setSchedulingStatus] =
    useState<SurveyDisplayStatus>(survey?.scheduling_status ?? "draft");
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormValues>(() =>
    survey ? scheduleToFormValues(survey.schedule) : createEmptyScheduleForm()
  );

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: isNew ? "Create Survey" : "Configure Survey",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: isNew ? "Create New" : survey?.name ?? "Configure" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, isNew, survey?.name]);

  // Block create flow when role lacks surveys:create (wait for session first)
  useEffect(() => {
    if (!isReady || !isNew) return;
    if (canCreateSurvey) return;
    toast.error("You do not have permission to create surveys");
    router.replace("/survey");
  }, [isReady, isNew, canCreateSurvey, router]);

  // Block edit flow when role lacks surveys:update
  useEffect(() => {
    if (!isReady || isNew || !survey) return;
    if (canUpdateSurvey) return;
    toast.error("You do not have permission to edit surveys");
    router.replace(`/survey/${survey.id}`);
  }, [isReady, isNew, survey, canUpdateSurvey, router]);

  const updateConfig = useCallback(
    <K extends keyof SurveyConfig>(key: K, value: SurveyConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const computedProgress = useMemo(
    () =>
      computeSurveyProgress(config, {
        enabled: scheduleForm.enabled,
        startAt: scheduleForm.startAt || null,
        endAt: scheduleForm.endAt || null,
        timezone: scheduleForm.timezone || "Asia/Kolkata",
        recurrence: scheduleForm.recurrence,
        lastScheduledAt: null,
      }),
    [config, scheduleForm]
  );

  const displayStatus = useMemo((): SurveyDisplayStatus => {
    if (schedulingStatus !== "draft") return schedulingStatus;
    if (scheduleForm.enabled) return "scheduled";
    return "draft";
  }, [schedulingStatus, scheduleForm.enabled]);

  const handleUnschedule = async () => {
    if (!surveyId || isUnscheduling) return;
    setIsUnscheduling(true);
    try {
      const updated = await unscheduleSurvey(surveyId);
      setSchedulingStatus("draft");
      setScheduleForm(scheduleToFormValues(updated.schedule));
      toast.success(`"${updated.name}" moved back to draft`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unschedule survey"
      );
    } finally {
      setIsUnscheduling(false);
    }
  };

  const tabIndex = ENABLED_TAB_ORDER.indexOf(activeTab);
  const isFirst = tabIndex <= 0;
  const isLast = tabIndex === ENABLED_TAB_ORDER.length - 1;
  const activeProgressKey = TAB_TO_PROGRESS_KEY[activeTab];
  const activeMissing =
    showValidationErrors && activeProgressKey
      ? computedProgress[activeProgressKey].missing
      : [];
  const invalidTabs = useMemo(() => {
    if (!showValidationErrors) return {};
    return {
      persona: !computedProgress.identity.complete,
      prompts: !computedProgress.prompts.complete,
      "survey-questions": !computedProgress["survey-questions"].complete,
      "client-contact": !computedProgress["client-contact"].complete,
    };
  }, [computedProgress, showValidationErrors]);

  const showBlockedStep = (key: StepRequirementKey) => {
    setShowValidationErrors(true);
    setActiveTab(PROGRESS_TO_TAB[key]);
  };

  const handleBack = () => {
    if (tabIndex > 0) setActiveTab(ENABLED_TAB_ORDER[tabIndex - 1]);
  };

  const handleNext = async () => {
    if (
      isLast &&
      scheduleForm.enabled &&
      schedulingStatus !== "scheduled" &&
      schedulingStatus !== "processing"
    ) {
      const parsed = parseScheduleForm(scheduleForm);
      if (!parsed.ok) {
        setShowValidationErrors(true);
        toast.error(parsed.error);
        return;
      }
      if (!isSurveyReadyToSchedule(config)) {
        const blockedKey = ([
          "identity",
          "prompts",
          "survey-questions",
          "client-contact",
        ] as StepRequirementKey[]).find(
          (key) => !computedProgress[key].complete
        );
        if (blockedKey) showBlockedStep(blockedKey);
        return;
      }
    }

    setIsSaving(true);
    try {
      const needsCreate = !surveyId;
      if (needsCreate && !canCreateSurvey) {
        toast.error("You do not have permission to create surveys");
        return;
      }
      if (!needsCreate && !canUpdateSurvey) {
        toast.error("You do not have permission to update surveys");
        return;
      }

      const requiredKeys = TAB_REQUIRED_KEYS[activeTab] ?? [];
      const blockedKey = requiredKeys.find((key) => !computedProgress[key].complete);
      if (blockedKey) {
        showBlockedStep(blockedKey);
        return;
      }

      const alreadyScheduled =
        schedulingStatus === "scheduled" ||
        schedulingStatus === "processing";

      let schedulePayload: Parameters<typeof saveSurvey>[1] = null;
      if (isLast && !alreadyScheduled) {
        const parsed = parseScheduleForm(scheduleForm);
        if (!parsed.ok) {
          toast.error(parsed.error);
          return;
        }
        schedulePayload = parsed.payload;
      }

      // API: saveSurvey() → POST /api/surveys
      const saved = await saveSurvey(
        {
          id: surveyId,
          config,
          step: Math.max(tabIndex, 0) + 1,
        },
        schedulePayload
      );

      if (!surveyId) {
        setSurveyId(saved.id);
      }

      if (isLast) {
        toast.success(
          schedulePayload?.enabled
            ? `"${saved.name}" updated and scheduled`
            : computedProgress.overallComplete
              ? `"${saved.name}" saved as complete draft`
              : `"${saved.name}" saved as draft`
        );
        router.push("/survey");
        return;
      }

      setActiveTab(ENABLED_TAB_ORDER[tabIndex + 1]);
      toast.success(
        computedProgress.overallComplete
          ? "Saved — draft is complete"
          : "Saved as draft — moving to next step"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save survey"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: SurveyConfigTab) => {
    if (isSurveyConfigTabDisabled(tab)) return;
    const targetIndex = ENABLED_TAB_ORDER.indexOf(tab);
    const canOpen = ENABLED_TAB_ORDER.slice(0, targetIndex).every((stepTab) => {
      const requirementKey = TAB_TO_PROGRESS_KEY[stepTab];
      if (!requirementKey) return true;
      const step = computedProgress[requirementKey];
      return step.optional || step.complete;
    });
    if (!canOpen) {
      const blockedKey = ENABLED_TAB_ORDER.slice(0, targetIndex)
        .map((stepTab) => TAB_TO_PROGRESS_KEY[stepTab])
        .find(
          (key): key is StepRequirementKey =>
            Boolean(key && !computedProgress[key].optional && !computedProgress[key].complete)
        );
      if (blockedKey) showBlockedStep(blockedKey);
      return;
    }
    setActiveTab(tab);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "persona":
        return (
          <PersonaTab
            values={config.persona}
            onChange={(v) => updateConfig("persona", v)}
            showRequiredError={activeMissing.includes("name")}
          />
        );
      case "prompts":
        return (
          <PromptsTab
            values={config.prompts}
            onChange={(v) => updateConfig("prompts", v)}
            showRequiredError={activeMissing.includes("greeting_or_systemPrompt")}
          />
        );
      case "survey-questions":
        return (
          <SurveyQuestionsTab
            surveyId={surveyId}
            values={config.surveyQuestions}
            onChange={(v) => updateConfig("surveyQuestions", v)}
            showRequiredError={activeMissing.includes("questions")}
          />
        );
      case "farewell":
        return (
          <FarewellTab
            value={config.prompts.farewell ?? ""}
            onChange={(farewell) =>
              updateConfig("prompts", { ...config.prompts, farewell })
            }
          />
        );
      case "client-contact":
        return (
          <ClientContactTab
            surveyId={surveyId}
            values={config.clientContact}
            onChange={(v) => updateConfig("clientContact", v)}
            showRequiredError={activeMissing.includes("contact_file")}
          />
        );
      case "schedule":
        return (
          <ScheduleTab
            values={scheduleForm}
            onChange={setScheduleForm}
            mode={isNew ? "create" : "edit"}
            readOnly={
              schedulingStatus === "scheduled" ||
              schedulingStatus === "processing"
            }
            onUnschedule={handleUnschedule}
            isUnscheduling={isUnscheduling}
          />
        );
      default:
        return null;
    }
  };

  if (!isReady) {
    return (
      <PageContainer size="full" className="pt-4 pb-4">
        <AppLoader variant="page" label="Checking permissions" hint="Please wait a moment" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      size="full"
      className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4 pb-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="shrink-0">
          <SurveyTopNav
            surveyName={config.persona.name}
            previewOpen={showPreview}
            onTogglePreview={() => setShowPreview((v) => !v)}
            status={displayStatus}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden xl:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
            <aside className="w-full shrink-0 rounded-[6px] border border-border/60 bg-card/70 p-3 shadow-card backdrop-blur-sm lg:w-[220px] lg:overflow-y-auto">
              <SurveyConfigTabs
                active={activeTab}
                onChange={handleTabChange}
                completedTabs={{
                  persona: computedProgress.identity.complete,
                  prompts: computedProgress.prompts.complete,
                  "survey-questions":
                    computedProgress["survey-questions"].complete,
                  farewell: computedProgress.farewell.complete,
                  "client-contact":
                    computedProgress["client-contact"].complete,
                  schedule: computedProgress.schedule.complete,
                }}
                invalidTabs={invalidTabs}
              />
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-border/60 bg-card/70 shadow-card backdrop-blur-sm">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 lg:p-7">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderTab()}
                </motion.div>
              </div>

              <div className="shrink-0 border-t border-border/50 bg-card/90 px-5 py-4 sm:px-6 lg:px-7">
                <SurveyConfigFooter
                  onBack={handleBack}
                  onNext={handleNext}
                  isFirst={isFirst}
                  isLast={isLast}
                  isSaving={isSaving}
                  scheduleEnabled={scheduleForm.enabled}
                  step={Math.max(tabIndex, 0) + 1}
                  total={ENABLED_TAB_ORDER.length}
                />
              </div>
            </div>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {showPreview && (
              <motion.div
                key="survey-preview"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 28 }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
                className="w-full shrink-0 overflow-y-auto xl:w-[360px]"
              >
                <SurveyConfigSidebar
                  agentName={config.persona.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </PageContainer>
  );
}
