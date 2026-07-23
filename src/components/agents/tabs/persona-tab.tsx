"use client";

import {
  BrainCircuit,
  Check,
  ChevronDown,
  HelpCircle,
  Mic,
  Music2,
  Phone,
  Settings2,
  Shield,
  SlidersHorizontal,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentAvatar, AGENT_AVATAR_OPTIONS } from "@/components/agents/agent-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AGENT_LANGUAGES,
  BACKGROUND_NOISE,
  LLM_PROVIDERS,
  STT_PROVIDERS,
  TTS_PROVIDERS,
} from "@/lib/constants/agent-config";
import type {
  AgentPersonaConfig,
  AgentStackAdvanced,
  AgentStackConfig,
  AgentStackFallback,
} from "@/types/agent";

interface PersonaTabProps {
  values: AgentPersonaConfig;
  onChange: (values: AgentPersonaConfig) => void;
}

type StageKind = "stt" | "llm" | "tts";

function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {children}
      </Label>
      {hint && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger type="button">
              <HelpCircle className="size-3.5 text-muted-foreground/60 transition-colors hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function SegmentedToggle({
  name,
  value,
  onChange,
  yesLabel = "On",
  noLabel = "Off",
}: {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="inline-flex h-10 w-full items-center rounded-[6px] border border-border bg-muted/40 p-1">
      {[
        { label: yesLabel, val: true },
        { label: noLabel, val: false },
      ].map((opt) => {
        const isActive = value === opt.val;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.val)}
            className="relative flex-1 rounded-[6px] px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId={`seg-${name}`}
                className={cn(
                  "absolute inset-0 rounded-[6px] shadow-subtle",
                  opt.val
                    ? "brand-gradient ring-1 ring-brand/25"
                    : "bg-card ring-1 ring-border/70"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={cn(
                "relative",
                isActive
                  ? opt.val
                    ? "text-brand-foreground"
                    : "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[11px] font-semibold tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-brand"
      />
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel>{label}</FieldLabel>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

const STT_LANG_OPTIONS = [
  { label: "en-IN", value: "en-IN" },
  { label: "hi-IN", value: "hi-IN" },
  { label: "en-US", value: "en-US" },
];

const STT_MODE_OPTIONS = [
  { label: "Transcribe", value: "transcribe" },
  { label: "Translate", value: "translate" },
];

const VOICE_OPTIONS = [
  { label: "Aakash", value: "Aakash" },
  { label: "Rachel", value: "Rachel" },
];

function providerLabel(
  options: { label: string; value: string }[],
  value: string
) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Expandable option list — different from native select / Vozzo dropdown */
function OptionListPicker({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-[6px] border bg-card px-3 text-left text-sm shadow-subtle transition-colors",
          open
            ? "border-brand/40 ring-2 ring-brand/15"
            : "border-border hover:border-brand/30"
        )}
      >
        <span className="truncate font-medium text-foreground">
          {selected?.label ?? "Select…"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-[6px] border border-border/70 bg-muted/20"
          >
            <div className="max-h-44 space-y-0.5 overflow-y-auto p-1.5">
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-[6px] px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-brand/10 font-semibold text-brand"
                          : "text-foreground hover:bg-card"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {active && <Check className="size-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageAdvancedDialog({
  open,
  onOpenChange,
  kind,
  stageTitle,
  providerName,
  advanced,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: StageKind;
  stageTitle: string;
  providerName: string;
  advanced: AgentStackAdvanced;
  onSave: (next: AgentStackAdvanced) => void;
}) {
  const [draft, setDraft] = useState(advanced);

  useEffect(() => {
    if (open) setDraft(advanced);
  }, [open, advanced]);

  const patch = <K extends keyof AgentStackAdvanced>(
    key: K,
    val: AgentStackAdvanced[K]
  ) => setDraft((prev) => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{stageTitle}</DialogTitle>
          <DialogDescription>
            {providerName} · CallHub provider tuning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {kind === "stt" && (
            <>
              <div className="space-y-2">
                <FieldLabel hint="Raise sensitivity to catch quieter speech turns">
                  High VAD sensitivity
                </FieldLabel>
                <SegmentedToggle
                  name={`vad-${stageTitle}`}
                  value={draft.highVadSensitivity ?? false}
                  onChange={(v) => patch("highVadSensitivity", v)}
                  yesLabel="Yes"
                  noLabel="No"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Recognition language</FieldLabel>
                <Select
                  value={draft.languageCode ?? "en-IN"}
                  onChange={(e) => patch("languageCode", e.target.value)}
                  options={STT_LANG_OPTIONS}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Mode</FieldLabel>
                <Select
                  value={draft.transcribeMode ?? "transcribe"}
                  onChange={(e) => patch("transcribeMode", e.target.value)}
                  options={STT_MODE_OPTIONS}
                />
              </div>
              <RangeField
                label="Interruption sensitivity"
                value={draft.interruptionSensitivity ?? 0.5}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => patch("interruptionSensitivity", v)}
              />
              <div className="space-y-1.5">
                <FieldLabel hint="Silence before the agent starts speaking">
                  Endpointing (ms)
                </FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={2000}
                  step={50}
                  value={draft.endpointingMs ?? 300}
                  onChange={(e) =>
                    patch("endpointingMs", Number(e.target.value))
                  }
                />
              </div>
              <ToggleRow
                label="Smart formatting"
                value={draft.smartFormatting ?? true}
                onChange={(v) => patch("smartFormatting", v)}
              />
            </>
          )}

          {kind === "llm" && (
            <>
              <RangeField
                label="Temperature"
                value={draft.temperature ?? 0.7}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => patch("temperature", v)}
              />
              <div className="space-y-1.5">
                <FieldLabel>Max response tokens</FieldLabel>
                <Input
                  type="number"
                  min={64}
                  max={4096}
                  step={64}
                  value={draft.maxTokens ?? 512}
                  onChange={(e) => patch("maxTokens", Number(e.target.value))}
                />
              </div>
              <ToggleRow
                label="Token streaming"
                value={draft.streaming ?? true}
                onChange={(v) => patch("streaming", v)}
              />
            </>
          )}

          {kind === "tts" && (
            <>
              <RangeField
                label="Speaking rate"
                value={draft.speakingRate ?? 1}
                min={0.5}
                max={2}
                step={0.1}
                suffix="x"
                onChange={(v) => patch("speakingRate", v)}
              />
              <RangeField
                label="Stability"
                value={draft.stability ?? 0.6}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => patch("stability", v)}
              />
              <RangeField
                label="Pitch"
                value={draft.pitch ?? 0}
                min={-10}
                max={10}
                step={1}
                onChange={(v) => patch("pitch", v)}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save tuning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FallbackBlock({
  kind,
  fallback,
  providerOptions,
  modelOptions,
  voiceOptions,
  onChange,
}: {
  kind: StageKind;
  fallback: AgentStackFallback;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  voiceOptions?: { label: string; value: string }[];
  onChange: (next: AgentStackFallback) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-[6px] border border-dashed border-brand/25 bg-brand/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
          <Shield className="size-3.5 text-brand" />
          Backup route
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-brand/15 px-3 pb-3 pt-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                If the primary provider drops mid-call, CallHub switches here
                automatically.
              </p>
              <div className="grid gap-2.5">
                <OptionListPicker
                  label="Backup provider"
                  value={fallback.provider}
                  options={providerOptions}
                  onChange={(v) => onChange({ ...fallback, provider: v })}
                />
                <OptionListPicker
                  label="Backup model"
                  value={fallback.model}
                  options={modelOptions}
                  onChange={(v) => onChange({ ...fallback, model: v })}
                />
                {kind === "tts" && voiceOptions && (
                  <OptionListPicker
                    label="Backup voice"
                    value={fallback.voice ?? ""}
                    options={voiceOptions}
                    onChange={(v) => onChange({ ...fallback, voice: v })}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 rounded-[6px] bg-muted/40 p-2">
                <span className="rounded-[4px] bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60">
                  stage: {kind}
                </span>
                <span className="rounded-[4px] bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60">
                  provider: {providerLabel(providerOptions, fallback.provider)}
                </span>
                <span className="rounded-[4px] bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60">
                  model: {fallback.model}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PipelineStage({
  kind,
  step,
  title,
  subtitle,
  icon: Icon,
  stack,
  providerOptions,
  modelOptions,
  voiceOptions,
  fallbackModelOptions,
  onChange,
}: {
  kind: StageKind;
  step: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stack: AgentStackConfig;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  voiceOptions?: { label: string; value: string }[];
  fallbackModelOptions: { label: string; value: string }[];
  onChange: (next: AgentStackConfig) => void;
}) {
  const [tuningOpen, setTuningOpen] = useState(false);
  const advanced = stack.advanced ?? {};
  const fallback = stack.fallback ?? {
    provider: providerOptions[1]?.value ?? providerOptions[0]?.value ?? "",
    model: fallbackModelOptions[0]?.value ?? "",
    voice: voiceOptions?.[0]?.value,
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="flex items-start gap-3 border-b border-border/40 bg-muted/15 px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] brand-gradient text-brand-foreground shadow-brand">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
            {step}
          </p>
          <h4 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <OptionListPicker
          label="Provider"
          value={stack.provider}
          options={providerOptions}
          onChange={(v) => onChange({ ...stack, provider: v })}
        />
        <OptionListPicker
          label="Model"
          value={stack.model}
          options={modelOptions}
          onChange={(v) => onChange({ ...stack, model: v })}
        />
        {voiceOptions && (
          <OptionListPicker
            label="Voice"
            value={stack.voice ?? ""}
            options={voiceOptions}
            onChange={(v) => onChange({ ...stack, voice: v })}
          />
        )}

        <button
          type="button"
          onClick={() => setTuningOpen(true)}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand transition-opacity hover:opacity-80"
        >
          <Settings2 className="size-3.5" />
          Advanced settings
        </button>

        <FallbackBlock
          kind={kind}
          fallback={fallback}
          providerOptions={providerOptions}
          modelOptions={fallbackModelOptions}
          voiceOptions={voiceOptions}
          onChange={(next) => onChange({ ...stack, fallback: next })}
        />
      </div>

      <StageAdvancedDialog
        open={tuningOpen}
        onOpenChange={setTuningOpen}
        kind={kind}
        stageTitle={title}
        providerName={providerLabel(providerOptions, stack.provider)}
        advanced={advanced}
        onSave={(next) => onChange({ ...stack, advanced: next })}
      />
    </article>
  );
}

export function PersonaTab({ values, onChange }: PersonaTabProps) {
  const update = <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  const selectedFace =
    AGENT_AVATAR_OPTIONS.find((o) => o.id === (values.avatarId ?? "aria")) ??
    AGENT_AVATAR_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Name & appearance — minimal */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Name & appearance
        </h3>

        <div className="space-y-1.5">
          <FieldLabel>Display name</FieldLabel>
          <div className="flex items-center gap-2">
            <AgentAvatar
              avatarId={selectedFace.id}
              className="size-8 shrink-0"
            />
            <Input
              id="agent-name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Aria — Sales Concierge"
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Face</FieldLabel>
          <div
            role="radiogroup"
            aria-label="Agent face"
            className="flex flex-wrap gap-1.5"
          >
            {AGENT_AVATAR_OPTIONS.map((opt) => {
              const selected = selectedFace.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={opt.label}
                  title={opt.label}
                  onClick={() => update("avatarId", opt.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[6px] border px-1.5 py-1 transition-colors",
                    selected
                      ? "border-brand/40 bg-brand/5"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <AgentAvatar
                    avatarId={opt.id}
                    selected={selected}
                    showCheck
                    className="size-7"
                  />
                  <span
                    className={cn(
                      "pr-0.5 text-[11px] font-medium",
                      selected ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call defaults */}
      <section className="space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Call defaults
          </h3>
          <p className="text-xs text-muted-foreground">
            Applied on every conversation this agent starts.
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-[6px] border border-border/50 bg-card p-3 shadow-card">
            <FieldLabel>Language</FieldLabel>
            <Select
              value={values.language}
              onChange={(e) => update("language", e.target.value)}
              options={AGENT_LANGUAGES}
            />
          </div>
          <div className="space-y-1.5 rounded-[6px] border border-border/50 bg-card p-3 shadow-card">
            <FieldLabel hint="Auto-disconnect after this many minutes">
              Max duration
            </FieldLabel>
            <div className="relative">
              <Input
                type="number"
                min={1}
                max={120}
                value={values.maxCallDurationMinutes}
                onChange={(e) =>
                  update("maxCallDurationMinutes", Number(e.target.value))
                }
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
                min
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border/50 bg-card px-3 py-2.5 shadow-card">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Phone className="size-3 text-brand" />
                <p className="text-sm font-medium text-foreground">
                  Audio cache
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Reuse clips to cut latency
              </p>
            </div>
            <Switch
              checked={values.audioCacheEnabled}
              onCheckedChange={(v) => update("audioCacheEnabled", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border/50 bg-card px-3 py-2.5 shadow-card">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Realtime audio
              </p>
              <p className="text-[11px] text-muted-foreground">
                Stream audio live on the call
              </p>
            </div>
            <Switch
              checked={values.livekitInferenceEnabled}
              onCheckedChange={(v) => update("livekitInferenceEnabled", v)}
            />
          </div>
        </div>
      </section>

      {/* Speech pipeline */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Speech pipeline
            </h3>
            <p className="text-xs text-muted-foreground">
              Primary providers, advanced tuning, and backup routes for each
              stage.
            </p>
          </div>
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-muted-foreground md:flex">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
              Listen
            </span>
            <span aria-hidden>→</span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
              Reason
            </span>
            <span aria-hidden>→</span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
              Speak
            </span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <PipelineStage
            kind="stt"
            step="01 · Listen"
            title="Speech to text"
            subtitle="Convert caller audio into text"
            icon={Mic}
            stack={values.stt}
            providerOptions={STT_PROVIDERS}
            modelOptions={[
              { label: "Saaras:v3", value: "Saaras:v3" },
              { label: "Nova-2", value: "nova-2" },
            ]}
            fallbackModelOptions={[
              { label: "Nova-2", value: "nova-2" },
              { label: "Saaras:v3", value: "Saaras:v3" },
              { label: "Whisper", value: "whisper" },
            ]}
            onChange={(next) => update("stt", next)}
          />
          <PipelineStage
            kind="llm"
            step="02 · Reason"
            title="Language model"
            subtitle="Decide what to say next"
            icon={BrainCircuit}
            stack={values.llm}
            providerOptions={LLM_PROVIDERS}
            modelOptions={[
              { label: "GPT-4o", value: "gpt-4o" },
              { label: "Claude Sonnet", value: "claude-sonnet" },
            ]}
            fallbackModelOptions={[
              { label: "Claude Sonnet", value: "claude-sonnet" },
              { label: "GPT-4o", value: "gpt-4o" },
              { label: "Gemini Flash", value: "gemini-flash" },
            ]}
            onChange={(next) => update("llm", next)}
          />
          <PipelineStage
            kind="tts"
            step="03 · Speak"
            title="Text to speech"
            subtitle="Voice the agent’s reply"
            icon={Volume2}
            stack={values.tts}
            providerOptions={TTS_PROVIDERS}
            modelOptions={[
              { label: "Google", value: "Google" },
              { label: "Neural2", value: "neural2" },
            ]}
            fallbackModelOptions={[
              { label: "Multilingual v2", value: "multilingual-v2" },
              { label: "Google", value: "Google" },
              { label: "Neural2", value: "neural2" },
            ]}
            voiceOptions={VOICE_OPTIONS}
            onChange={(next) => update("tts", next)}
          />
        </div>
      </section>

      <AdditionalSettingsPanel values={values} onUpdate={update} />
    </div>
  );
}

function AdditionalSettingsPanel({
  values,
  onUpdate,
}: {
  values: AgentPersonaConfig;
  onUpdate: <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-brand/10 text-brand">
            <SlidersHorizontal className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              Additional settings
            </span>
            <span className="block text-xs text-muted-foreground">
              Ambience, analytics, memory, and call intelligence extras.
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 border-t border-border/50 px-5 py-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Music2 className="size-4 text-brand" />
                  <div>
                    <h4 className="text-sm font-semibold">Call ambience</h4>
                    <p className="text-xs text-muted-foreground">
                      Ambient sound so outbound calls feel more natural.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_NOISE.map((opt) => {
                    const active = values.backgroundNoise === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdate("backgroundNoise", opt.value)}
                        className={cn(
                          "inline-flex h-9 items-center rounded-[6px] border px-3.5 text-xs font-semibold transition-all",
                          active
                            ? "border-brand/40 brand-gradient text-brand-foreground shadow-brand"
                            : "border-border/70 bg-muted/20 text-muted-foreground hover:border-brand/30 hover:text-foreground"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Call intelligence</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        key: "analyticsEnabled" as const,
                        label: "Enable analytics",
                        hint: "Track outcomes and quality metrics",
                      },
                      {
                        key: "aiComprehendEnabled" as const,
                        label: "AI comprehend",
                        hint: "Extract intents and entities live",
                      },
                      {
                        key: "memoryContextEnabled" as const,
                        label: "Memory context",
                        hint: "Keep recent turns in working memory",
                      },
                      {
                        key: "fallbackMemoryEnabled" as const,
                        label: "Fallback memory",
                        hint: "Reuse memory if primary store fails",
                      },
                    ] as const
                  ).map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-3 rounded-[6px] border border-border/60 bg-muted/15 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {row.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {row.hint}
                        </p>
                      </div>
                      <div className="w-[7.5rem] shrink-0">
                        <SegmentedToggle
                          name={row.key}
                          value={values[row.key] ?? false}
                          onChange={(v) => onUpdate(row.key, v)}
                          yesLabel="Yes"
                          noLabel="No"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="max-w-xs space-y-1.5">
                  <FieldLabel hint="How many prior turns stay in memory">
                    Max context items
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={values.maxContextItems ?? 20}
                    onChange={(e) =>
                      onUpdate("maxContextItems", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
