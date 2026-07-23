"use client";

import {
  BrainCircuit,
  Check,
  ChevronDown,
  HelpCircle,
  Mic,
  Phone,
  Volume2,
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
  LLM_PROVIDERS,
  STT_PROVIDERS,
  TTS_PROVIDERS,
} from "@/lib/constants/agent-config";
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

function PipelineStage({
  step,
  title,
  subtitle,
  icon: Icon,
  stack,
  providerOptions,
  modelOptions,
  onChange,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stack: AgentStackConfig;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  onChange: (next: AgentStackConfig) => void;
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
      </div>
    </article>
  );
}

export function PersonaTab({ values, onChange }: PersonaTabProps) {
  const update = <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  const voiceOptions = [
    { label: "Aakash", value: "Aakash" },
    { label: "Rachel", value: "Rachel" },
  ];

  return (
    <div className="space-y-6">
      {/* Name */}
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
            <FieldLabel hint="Shared voice used for text to speech">
              Voice
            </FieldLabel>
            <Select
              value={values.tts.voice ?? voiceOptions[0].value}
              onChange={(e) =>
                update("tts", { ...values.tts, voice: e.target.value })
              }
              options={voiceOptions}
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
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border/50 bg-card px-3 py-2.5 shadow-card sm:col-span-2">
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
            stack={values.tts}
            providerOptions={TTS_PROVIDERS}
            modelOptions={[
              { label: "Google", value: "Google" },
              { label: "Neural2", value: "neural2" },
            ]}
            onChange={(next) => update("tts", next)}
          />
        </div>
      </section>
    </div>
  );
}
