"use client";

import {
  BrainCircuit,
  ChevronDown,
  HelpCircle,
  Mic,
  Phone,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { VoicePickerDialog } from "@/components/library/voices/voice-picker-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AGENT_LANGUAGES,
  LLM_PROVIDERS,
  STT_PROVIDERS,
  TTS_MODELS_BY_PROVIDER,
  TTS_PROVIDERS,
} from "@/lib/constants/agent-config";
import { cn } from "@/lib/utils";
import type {
  AgentPersonaConfig,
  AgentStackConfig,
} from "@/types/agent";

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

function OptionListPicker({
  label,
  value,
  options,
  onChange,
  hint,
  searchPlaceholder = "Search…",
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  hint?: string;
  searchPlaceholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <SearchableSelect
        value={value}
        onChange={onChange}
        options={options}
        searchPlaceholder={searchPlaceholder}
        aria-label={label}
      />
    </div>
  );
}

function PipelineStage({
  step,
  title,
  subtitle,
  icon: Icon,
  stack,
  providerOptions,
  modelOptions,
  onChange,
  extra,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stack: AgentStackConfig;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  onChange: (next: AgentStackConfig) => void;
  extra?: ReactNode;
}) {
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
        {extra}
      </div>
    </article>
  );
}

function VoiceSelectField({
  value,
  disabled,
  onOpen,
}: {
  value: string;
  disabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel hint="Opens Voice Explorer — filtered by language + provider">
        Voice
      </FieldLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={onOpen}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-[6px] border border-border bg-card px-3.5 text-left text-sm shadow-subtle transition-[color,box-shadow,border-color] duration-200 hover:border-border focus-visible:border-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate font-medium text-foreground">
          <Volume2 className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{value || "Select Voice"}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </div>
  );
}

export function PersonaTab({ values, onChange }: PersonaTabProps) {
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);

  const update = <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  const ttsProvider =
    values.tts.provider === "google" || values.tts.provider === "elevenlabs"
      ? values.tts.provider
      : "google";
  const language = values.language;
  const hasVoiceSource = true;

  const ttsModelOptions =
    TTS_MODELS_BY_PROVIDER[ttsProvider] ?? TTS_MODELS_BY_PROVIDER.google;

  // Keep provider/model valid (no Azure; models match Vozzo lists)
  useEffect(() => {
    const provider =
      values.tts.provider === "elevenlabs" ? "elevenlabs" : "google";
    const models = TTS_MODELS_BY_PROVIDER[provider];
    const modelOk = models.some((m) => m.value === values.tts.model);

    if (provider !== values.tts.provider || !modelOk) {
      update("tts", {
        ...values.tts,
        provider,
        model: modelOk ? values.tts.model : models[0].value,
        voice: provider !== values.tts.provider ? "" : values.tts.voice,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.tts.provider, values.tts.model]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="space-y-1.5">
          <FieldLabel>Survey name</FieldLabel>
          <Input
            id="agent-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Customer Feedback Survey"
            className="h-9"
          />
        </div>
      </section>

      <section className="space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Call settings
          </h3>
          <p className="text-xs text-muted-foreground">
            Language and call limits for this survey.
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-[6px] border border-border/50 bg-card p-3 shadow-card">
            <OptionListPicker
              label="Language"
              value={values.language}
              options={AGENT_LANGUAGES}
              onChange={(v) => {
                // Language change — clear voice so user re-picks for new lang
                onChange({
                  ...values,
                  language: v,
                  tts: { ...values.tts, voice: "" },
                });
              }}
              searchPlaceholder="Search languages…"
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

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Speech pipeline
            </h3>
            <p className="text-xs text-muted-foreground">
              Primary providers and models for each stage.
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
            onChange={(next) => update("stt", next)}
          />
          <PipelineStage
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
            onChange={(next) => update("llm", next)}
          />
          <PipelineStage
            step="03 · Speak"
            title="Text to speech"
            subtitle="Voice the agent’s reply"
            icon={Volume2}
            stack={{ ...values.tts, provider: ttsProvider }}
            providerOptions={TTS_PROVIDERS}
            modelOptions={ttsModelOptions}
            onChange={(next) => {
              const models =
                TTS_MODELS_BY_PROVIDER[next.provider] ?? ttsModelOptions;
              const modelOk = models.some((m) => m.value === next.model);
              const providerChanged = next.provider !== ttsProvider;
              update("tts", {
                ...next,
                // Provider change → first model of that provider (Vozzo behavior)
                model: modelOk ? next.model : (models[0]?.value ?? next.model),
                voice: providerChanged ? "" : next.voice,
              });
            }}
            extra={
              <VoiceSelectField
                value={values.tts.voice ?? ""}
                disabled={!hasVoiceSource}
                onOpen={() => setVoicePickerOpen(true)}
              />
            }
          />
        </div>
      </section>

      <VoicePickerDialog
        open={voicePickerOpen}
        onOpenChange={setVoicePickerOpen}
        language={language}
        provider={ttsProvider}
        selectedVoice={values.tts.voice}
        onSelect={(voice) =>
          update("tts", {
            ...values.tts,
            voice: voice?.name ?? "",
          })
        }
      />
    </div>
  );
}
