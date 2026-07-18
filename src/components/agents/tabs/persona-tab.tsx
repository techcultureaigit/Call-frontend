"use client";

import {
  AudioLines,
  BrainCircuit,
  Check,
  ChevronDown,
  HelpCircle,
  Layers,
  Mic,
  Music2,
  Sparkles,
  Volume2,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import type { AgentPersonaConfig } from "@/types/agent";

interface PersonaTabProps {
  values: AgentPersonaConfig;
  onChange: (values: AgentPersonaConfig) => void;
}

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
}: {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex h-10 w-full items-center rounded-lg border border-border bg-muted/40 p-1">
      {[
        { label: "On", val: true },
        { label: "Off", val: false },
      ].map((opt) => {
        const isActive = value === opt.val;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.val)}
            className="relative flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId={`seg-${name}`}
                className="absolute inset-0 rounded-md bg-card shadow-subtle ring-1 ring-border/70"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={cn(
                "relative",
                isActive ? "text-foreground" : "text-muted-foreground"
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

const STAGE_ACCENT = {
  teal: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400",
  violet:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  brand: "bg-brand/10 text-brand ring-brand/20",
} as const;

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
    <div className="flex items-center justify-between">
      <FieldLabel>{label}</FieldLabel>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function SttAdvanced() {
  const [interrupt, setInterrupt] = useState(0.5);
  const [endpointing, setEndpointing] = useState(300);
  const [smartFormat, setSmartFormat] = useState(true);
  return (
    <>
      <RangeField
        label="Interruption sensitivity"
        value={interrupt}
        min={0}
        max={1}
        step={0.1}
        onChange={setInterrupt}
      />
      <div className="space-y-1.5">
        <FieldLabel hint="Silence duration before the agent responds">
          Endpointing (ms)
        </FieldLabel>
        <Input
          type="number"
          min={0}
          max={2000}
          step={50}
          value={endpointing}
          onChange={(e) => setEndpointing(Number(e.target.value))}
        />
      </div>
      <ToggleRow
        label="Smart formatting"
        value={smartFormat}
        onChange={setSmartFormat}
      />
    </>
  );
}

function LlmAdvanced() {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [streaming, setStreaming] = useState(true);
  return (
    <>
      <RangeField
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={setTemperature}
      />
      <div className="space-y-1.5">
        <FieldLabel hint="Maximum tokens per response">
          Max response tokens
        </FieldLabel>
        <Input
          type="number"
          min={64}
          max={4096}
          step={64}
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
        />
      </div>
      <ToggleRow
        label="Token streaming"
        value={streaming}
        onChange={setStreaming}
      />
    </>
  );
}

function TtsAdvanced() {
  const [rate, setRate] = useState(1);
  const [stability, setStability] = useState(0.6);
  const [pitch, setPitch] = useState(0);
  return (
    <>
      <RangeField
        label="Speaking rate"
        value={rate}
        min={0.5}
        max={2}
        step={0.1}
        suffix="x"
        onChange={setRate}
      />
      <RangeField
        label="Stability"
        value={stability}
        min={0}
        max={1}
        step={0.1}
        onChange={setStability}
      />
      <RangeField
        label="Pitch"
        value={pitch}
        min={-10}
        max={10}
        step={1}
        onChange={setPitch}
      />
    </>
  );
}

function OrbitAdvanced() {
  const [temperature, setTemperature] = useState(0.7);
  const [rate, setRate] = useState(1);
  const [interrupt, setInterrupt] = useState(0.5);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  return (
    <>
      <RangeField
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={setTemperature}
      />
      <RangeField
        label="Speaking rate"
        value={rate}
        min={0.5}
        max={2}
        step={0.1}
        suffix="x"
        onChange={setRate}
      />
      <RangeField
        label="Interruption sensitivity"
        value={interrupt}
        min={0}
        max={1}
        step={0.1}
        onChange={setInterrupt}
      />
      <ToggleRow
        label="Noise suppression"
        value={noiseSuppression}
        onChange={setNoiseSuppression}
      />
    </>
  );
}

function StackColumn({
  title,
  step,
  icon: Icon,
  accent,
  provider,
  model,
  voice,
  providerOptions,
  modelOptions,
  voiceOptions,
  onProviderChange,
  onModelChange,
  onVoiceChange,
  advanced,
}: {
  title: string;
  step: string;
  icon: LucideIcon;
  accent: keyof typeof STAGE_ACCENT;
  provider: string;
  model: string;
  voice?: string;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  voiceOptions?: { label: string; value: string }[];
  onProviderChange: (v: string) => void;
  onModelChange: (v: string) => void;
  onVoiceChange?: (v: string) => void;
  advanced?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl ring-1 ring-inset",
            STAGE_ACCENT[accent]
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {step}
          </p>
          <h4 className="truncate text-sm font-semibold tracking-tight">
            {title}
          </h4>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <FieldLabel>Provider</FieldLabel>
          <Select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            options={providerOptions}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Model</FieldLabel>
          <Select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            options={modelOptions}
          />
        </div>
        {voiceOptions && onVoiceChange && (
          <div className="space-y-1.5">
            <FieldLabel>Voice</FieldLabel>
            <Select
              value={voice ?? ""}
              onChange={(e) => onVoiceChange(e.target.value)}
              options={voiceOptions}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          disabled={!advanced}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          Advanced
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-muted-foreground transition-colors hover:text-foreground">
            Fallback
          </summary>
          <p className="mt-2 text-[11px] leading-relaxed">
            Configure fallback provider if primary fails.
          </p>
        </details>
      </div>

      <AnimatePresence initial={false}>
        {expanded && advanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-muted/25 p-3">
              {advanced}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PipelineConnector() {
  return (
    <div className="hidden items-center justify-center lg:flex">
      <span className="flex size-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-subtle">
        <Waypoints className="size-3.5" />
      </span>
    </div>
  );
}

const MODES = [
  {
    id: "orbit",
    label: "Orbit",
    sub: "Speech-to-Speech",
    icon: AudioLines,
    features: ["Lowest latency", "Single unified model"],
    price: "$18",
  },
  {
    id: "quantum",
    label: "Quantum",
    sub: "STT · LLM · TTS",
    icon: Layers,
    features: ["Full pipeline control", "Best flexibility"],
    price: "$11",
  },
] as const;

const S2S_PROVIDERS = [
  { label: "OpenAI", value: "openai" },
  { label: "Google", value: "google" },
];

const S2S_MODELS = [
  { label: "GPT-4o Realtime", value: "gpt-4o-realtime" },
  { label: "Gemini 2.0 Live", value: "gemini-live" },
];

const VOICE_OPTIONS = [
  { label: "Aakash", value: "Aakash" },
  { label: "Rachel", value: "Rachel" },
];

export function PersonaTab({ values, onChange }: PersonaTabProps) {
  const update = <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  const isOrbit = values.modelMode === "orbit";

  return (
    <div className="space-y-8">
      {/* Agent identity */}
      <div className="max-w-xl space-y-2">
        <FieldLabel>Agent Name</FieldLabel>
        <div className="relative">
          <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand/70" />
          <Input
            id="agent-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Aria — Sales Concierge"
            className="pl-10 text-[15px] font-medium"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This is how your agent will be identified across calls and analytics.
        </p>
      </div>

      {/* Voice AI configuration */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-card">
        <header className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-inset ring-brand/15">
            <Waypoints className="size-5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">
              Voice AI Agent Configuration
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure your agent&apos;s speech pipeline and model stack.
            </p>
          </div>
        </header>

        <div className="space-y-7 p-5">
          {/* Engine mode selection */}
          <div className="space-y-3">
            <FieldLabel>Engine mode</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODES.map((mode) => {
                const isActive = values.modelMode === mode.id;
                const ModeIcon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => update("modelMode", mode.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                      isActive
                        ? "border-brand/50 bg-brand/6 shadow-brand"
                        : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-border hover:shadow-elevated"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl ring-1 ring-inset transition-colors",
                            isActive
                              ? "bg-brand text-brand-foreground ring-brand/30"
                              : "bg-muted text-muted-foreground ring-border group-hover:text-foreground"
                          )}
                        >
                          <ModeIcon className="size-5" />
                        </span>
                        <div>
                          <p className="text-base font-semibold tracking-tight">
                            {mode.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mode.sub}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border transition-all",
                          isActive
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border text-transparent"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {mode.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="size-1 rounded-full bg-brand/60" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                      <span className="text-sm font-semibold text-foreground">
                        {mode.price}
                      </span>
                      <span className="ml-1">/ 1k min</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global settings */}
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <FieldLabel>Language</FieldLabel>
              <Select
                value={values.language}
                onChange={(e) => update("language", e.target.value)}
                options={AGENT_LANGUAGES}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Audio Cache</FieldLabel>
              <SegmentedToggle
                name="audio-cache"
                value={values.audioCacheEnabled}
                onChange={(v) => update("audioCacheEnabled", v)}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel hint="Enable real-time inference via Livekit">
                Livekit Inference
              </FieldLabel>
              <SegmentedToggle
                name="livekit"
                value={values.livekitInferenceEnabled}
                onChange={(v) => update("livekitInferenceEnabled", v)}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel hint="Maximum call length before auto-disconnect">
                Max Duration (min)
              </FieldLabel>
              <Input
                type="number"
                min={1}
                max={120}
                value={values.maxCallDurationMinutes}
                onChange={(e) =>
                  update("maxCallDurationMinutes", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Model pipeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Model pipeline</FieldLabel>
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                {isOrbit
                  ? "Single unified speech-to-speech model"
                  : "Audio flows left to right"}
              </span>
            </div>

            {isOrbit ? (
              <motion.div
                key="orbit-pipeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="max-w-xl"
              >
                <StackColumn
                  title="Speech-to-Speech"
                  step="Unified realtime model"
                  icon={AudioLines}
                  accent="brand"
                  provider={values.llm.provider}
                  model={values.llm.model}
                  voice={values.tts.voice}
                  providerOptions={S2S_PROVIDERS}
                  modelOptions={S2S_MODELS}
                  voiceOptions={VOICE_OPTIONS}
                  onProviderChange={(v) =>
                    update("llm", { ...values.llm, provider: v })
                  }
                  onModelChange={(v) =>
                    update("llm", { ...values.llm, model: v })
                  }
                  onVoiceChange={(v) =>
                    update("tts", { ...values.tts, voice: v })
                  }
                  advanced={<OrbitAdvanced />}
                />
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3.5 text-brand/70" />
                  Orbit processes audio in a single model for the lowest latency
                  — no separate STT / LLM / TTS stages.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="quantum-pipeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch"
              >
                <StackColumn
                  title="Speech-to-Text"
                  step="Input"
                  icon={Mic}
                  accent="teal"
                  provider={values.stt.provider}
                  model={values.stt.model}
                  providerOptions={STT_PROVIDERS}
                  modelOptions={[
                    { label: "Saaras:v3", value: "Saaras:v3" },
                    { label: "Nova-2", value: "nova-2" },
                  ]}
                  onProviderChange={(v) =>
                    update("stt", { ...values.stt, provider: v })
                  }
                  onModelChange={(v) =>
                    update("stt", { ...values.stt, model: v })
                  }
                  advanced={<SttAdvanced />}
                />
                <PipelineConnector />
                <StackColumn
                  title="Large Language Model"
                  step="Reasoning"
                  icon={BrainCircuit}
                  accent="violet"
                  provider={values.llm.provider}
                  model={values.llm.model}
                  providerOptions={LLM_PROVIDERS}
                  modelOptions={[
                    { label: "GPT-4o", value: "gpt-4o" },
                    { label: "Claude Sonnet", value: "claude-sonnet" },
                  ]}
                  onProviderChange={(v) =>
                    update("llm", { ...values.llm, provider: v })
                  }
                  onModelChange={(v) =>
                    update("llm", { ...values.llm, model: v })
                  }
                  advanced={<LlmAdvanced />}
                />
                <PipelineConnector />
                <StackColumn
                  title="Text-to-Speech"
                  step="Output"
                  icon={Volume2}
                  accent="amber"
                  provider={values.tts.provider}
                  model={values.tts.model}
                  voice={values.tts.voice}
                  providerOptions={TTS_PROVIDERS}
                  modelOptions={[
                    { label: "Google", value: "Google" },
                    { label: "Neural2", value: "neural2" },
                  ]}
                  voiceOptions={VOICE_OPTIONS}
                  onProviderChange={(v) =>
                    update("tts", { ...values.tts, provider: v })
                  }
                  onModelChange={(v) =>
                    update("tts", { ...values.tts, model: v })
                  }
                  onVoiceChange={(v) =>
                    update("tts", { ...values.tts, voice: v })
                  }
                  advanced={<TtsAdvanced />}
                />
              </motion.div>
            )}
          </div>

          {/* Background audio */}
          <div className="max-w-xs space-y-2">
            <FieldLabel>Background Audio</FieldLabel>
            <div className="relative">
              <Music2 className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Select
                value={values.backgroundNoise}
                onChange={(e) => update("backgroundNoise", e.target.value)}
                options={BACKGROUND_NOISE}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
