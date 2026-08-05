"use client";

/**
 * survey-tabs.tsx
 * Create/edit form tabs — persona, prompts, questions, contacts, schedule.
 *
 * API calls in this file:
 *   uploadSurveyQuestionsFile() → POST /api/surveys/:id/questions-file
 *   uploadSurveyContactFile()   → POST /api/surveys/:id/contact-file
 */

import {
  uploadSurveyQuestionsFile,
  uploadSurveyContactFile,
} from "./api";
import { SurveyScheduleFields } from "./survey-dialogs";
import type { ScheduleFormValues } from "./survey-dialogs";
import { downloadSurveyQuestionsSample, parseAndValidateSurveyQuestionsFile, downloadClientContactsSample } from "./survey-upload";
import { VoicePickerDialog } from "@/modules/voices/voice-picker-dialog";
import { AppLoader, AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_FAREWELL, AGENT_LANGUAGES as SURVEY_LANGUAGES, LLM_PROVIDERS, STT_PROVIDERS, TTS_MODELS_BY_PROVIDER, TTS_PROVIDERS, getSurveyQuestionTypeLabel, SURVEY_QUESTION_TYPES } from "@/lib/constants/agent-config";
import { cn } from "@/lib/utils";
import {
  fetchClientContactsFromUrl,
  sanitizeContactRows,
  parseAndValidateClientContactsFile,
} from "./survey-contacts";
import type { ClientContactRow } from "./survey-contacts";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import type { AgentPromptsConfig as SurveyPromptsConfig, AgentPersonaConfig as SurveyPersonaConfig, AgentStackConfig as SurveyStackConfig, AgentSurveyQuestion as SurveyQuestion, AgentSurveyQuestionOption as SurveyQuestionOption, AgentSurveyQuestionsConfig as SurveyQuestionsConfig, AgentClientContactConfig as SurveyClientContactConfig } from "@/types/agent";
import { Users, Sparkles, History, BrainCircuit, ChevronDown, HelpCircle, Mic, Phone, Volume2, Download, ExternalLink, Plus, Trash2, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

interface ClientContactsPreviewProps {
  /** File URL — used to fetch rows dynamically */
  fileUrl?: string;
  /** Exact uploaded file name shown in UI */
  fileName?: string;
  /** Cached rows from upload parse (fallback / instant show) */
  contacts?: ClientContactRow[];
  className?: string;
  compact?: boolean;
  /**
   * When true and fileUrl is set, fetch rows from URL after mount
   * (even if cached contacts exist). Cached rows show first, then URL data replaces.
   */
  preferUrlFetch?: boolean;
}

export function ClientContactsPreview({
  fileUrl,
  fileName,
  contacts: initialContacts,
  className,
  compact = false,
  preferUrlFetch = false,
}: ClientContactsPreviewProps) {
  const cachedContacts = useMemo(
    () => sanitizeContactRows(initialContacts),
    [initialContacts]
  );
  const [rows, setRows] = useState<ClientContactRow[]>(cachedContacts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromUrl, setFromUrl] = useState(false);

  const displayName = fileName?.trim() || "Uploaded file";

  const loadFromUrl = async (url: string) => {
    setLoading(true);
    setError("");
    try {
      const parsed = await fetchClientContactsFromUrl(url);
      setRows(parsed);
      setFromUrl(true);
      if (parsed.length === 0) {
        setError("No contact rows found in file");
      }
    } catch (err) {
      setFromUrl(false);
      setRows((prev) => {
        const fallback = prev.length > 0 ? prev : cachedContacts;
        if (fallback.length === 0) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load contacts from URL"
          );
        } else {
          setError("");
        }
        return fallback.length > 0 ? fallback : prev;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cachedContacts.length > 0) {
      setRows(cachedContacts);
      setFromUrl(false);
      setError("");
    }

    const url = fileUrl?.trim();
    if (url && (preferUrlFetch || cachedContacts.length === 0)) {
      void loadFromUrl(url);
      return;
    }

    if (cachedContacts.length === 0 && !url) {
      setRows([]);
      setError("");
      setFromUrl(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, cachedContacts.length, preferUrlFetch]);

  if (!fileUrl && cachedContacts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-[8px] border border-border/60 bg-card p-3 sm:p-4",
        className
      )}
    >
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4 text-primary" />
          Contact data
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {loading
            ? `Fetching from file URL…`
            : rows.length > 0
              ? `${rows.length} contact(s) · ${displayName}${fromUrl ? " · from URL" : ""}`
              : displayName}
        </p>
      </div>

      {error ? (
        <p className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {loading && rows.length === 0 ? (
        <AppLoader variant="compact" label="Fetching contacts" />
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto rounded-[6px] border border-border/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`contact-${index}`}
                  className="border-b border-border/40 last:border-0"
                >
                  <td
                    className={cn(
                      "px-3 text-muted-foreground tabular-nums",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                  >
                    {index + 1}
                  </td>
                  <td
                    className={cn(
                      "max-w-55 truncate px-3 font-mono tabular-nums",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                    title={row.contact || undefined}
                  >
                    {row.contact || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error && !loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No contact rows to show.
        </p>
      ) : null}
    </div>
  );
}

interface FarewellTabProps {
  value: string;
  onChange: (farewell: string) => void;
}

export function FarewellTab({ value, onChange }: FarewellTabProps) {
  const farewellLeft = 500 - (value?.length ?? 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Farewell</h2>
        <p className="text-sm text-muted-foreground">
          Closing message spoken at the end of the survey call.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="farewell">Survey Farewell</Label>
        <textarea
          id="farewell"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          maxLength={500}
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={DEFAULT_FAREWELL}
        />
        <p
          className={cn(
            "text-xs",
            farewellLeft < 40 ? "text-amber-600" : "text-muted-foreground"
          )}
        >
          {farewellLeft} characters left
        </p>
      </div>
    </div>
  );
}

interface PromptsTabProps {
  values: SurveyPromptsConfig;
  onChange: (values: SurveyPromptsConfig) => void;
}

export function PromptsTab({ values, onChange }: PromptsTabProps) {
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const update = <K extends keyof SurveyPromptsConfig>(
    key: K,
    val: SurveyPromptsConfig[K]
  ) => onChange({ ...values, [key]: val });

  const handleEditWithAi = () => {
    setLoadingPrompt(true);
    setTimeout(() => {
      update(
        "systemPrompt",
        values.systemPrompt +
          "\n\n[AI-enhanced] Added empathy cues and objection handling patterns."
      );
      setLoadingPrompt(false);
    }, 1500);
  };

  const greetingLeft = 250 - values.greeting.length;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="greeting">Survey Greetings</Label>
        <textarea
          id="greeting"
          value={values.greeting}
          onChange={(e) => update("greeting", e.target.value)}
          rows={3}
          maxLength={250}
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Hello! Thank you for taking our call today. How are you doing?"
        />
        <p
          className={cn(
            "text-xs",
            greetingLeft < 20 ? "text-amber-600" : "text-muted-foreground"
          )}
        >
          {greetingLeft} characters left
        </p>
      </div>

      <div className="max-w-xs space-y-1.5">
        <Label>Survey Greets First?</Label>
        <Select
          value={values.greetsFirst ? "yes" : "no"}
          onChange={(e) => update("greetsFirst", e.target.value === "yes")}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          className="rounded-[6px]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Survey Prompt</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditWithAi}
              disabled={loadingPrompt}
              className="rounded-[6px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10"
            >
              <Sparkles className="size-3.5 text-violet-600" />
              Edit with AI
            </Button>
            <Button variant="outline" size="sm" className="rounded-[6px]">
              <History className="size-3.5" />
              Prompt History
            </Button>
          </div>
        </div>
        <div className="relative">
          {loadingPrompt ? (
            <AppLoader variant="compact" label="Loading" className="h-48" />
          ) : (
            <textarea
              value={values.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
              rows={10}
              className="w-full rounded-[6px] border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="You are a professional voice AI survey for enterprise customer outreach. Conduct surveys naturally, handle objections gracefully, and maintain a warm professional tone throughout the conversation."
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface PersonaTabProps {
  values: SurveyPersonaConfig;
  onChange: (values: SurveyPersonaConfig) => void;
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
  stack: SurveyStackConfig;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  onChange: (next: SurveyStackConfig) => void;
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

  const update = <K extends keyof SurveyPersonaConfig>(
    key: K,
    val: SurveyPersonaConfig[K]
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
            id="survey-name"
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
              options={SURVEY_LANGUAGES}
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
            subtitle="Voice the survey’s reply"
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

interface SurveyQuestionsTabProps {
  surveyId?: string;
  values: SurveyQuestionsConfig;
  onChange: (values: SurveyQuestionsConfig) => void;
}

function makeOption(label: string): SurveyQuestionOption {
  const trimmed = label.trim();
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: trimmed,
    value: trimmed.toLowerCase().replace(/\s+/g, "_"),
  };
}

function parseOptionsPipe(raw: string): SurveyQuestionOption[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(makeOption);
}

const SKIP_DISPLAY_KEYS = new Set([
  "id",
  "_id",
  "type",
  "options",
  "question",
  "__v",
]);

function getQuestionDisplayText(q: SurveyQuestion): string {
  if (typeof q.question === "string" && q.question.trim())
    return q.question.trim();
  for (const [key, value] of Object.entries(q)) {
    if (SKIP_DISPLAY_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Untitled row";
}

function getDynamicFieldEntries(
  q: SurveyQuestion
): Array<[string, string]> {
  return Object.entries(q)
    .filter(([key, value]) => {
      if (SKIP_DISPLAY_KEYS.has(key)) return false;
      return typeof value === "string" && value.trim().length > 0;
    })
    .map(([key, value]) => [key, String(value)]);
}

const TYPE_OPTIONS = SURVEY_QUESTION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

export function SurveyQuestionsTab({
  surveyId,
  values,
  onChange,
}: SurveyQuestionsTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formatErrors, setFormatErrors] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState("text");
  const [questionText, setQuestionText] = useState("");
  const [optionsPipe, setOptionsPipe] = useState("");

  const isMulti = questionType === "multi";
  const fileUrl = getContactFileOpenUrl(values.questionsFileUrl || "");

  const updateQuestions = (questions: SurveyQuestion[]) => {
    onChange({
      ...values,
      questionsFileUrl: "",
      questionsFileName: "",
      questions,
    });
  };

  const addQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Enter a question first");
      return;
    }
    const options = isMulti ? parseOptionsPipe(optionsPipe) : [];
    if (isMulti && options.length < 2) {
      toast.error("Add at least 2 options, separated by |");
      return;
    }

    updateQuestions([
      ...values.questions,
      {
        id: `sq-${Date.now()}`,
        type: questionType,
        question: questionText.trim(),
        ...(isMulti ? { options } : {}),
      },
    ]);
    setQuestionText("");
    setOptionsPipe("");
  };

  const handleUpload = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(lower)) {
      const msg = "Only Excel (.xlsx / .xls) or CSV files are allowed";
      setFormatErrors([msg]);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setFormatErrors([]);
    try {
      const validated = await parseAndValidateSurveyQuestionsFile(file);
      if (!validated.ok) {
        setFormatErrors(validated.errors);
        toast.error("Invalid questions file — fix the errors and try again");
        return;
      }

      if (!surveyId) {
        throw new Error("Save previous steps first to upload questions");
      }

      // API: uploadSurveyQuestionsFile() → POST /api/surveys/:id/questions-file
      const uploaded = await uploadSurveyQuestionsFile(
        surveyId,
        file
      );
      const sq = uploaded.config.surveyQuestions;
      onChange({
        enabled: sq.enabled,
        questionsFileUrl: sq.questionsFileUrl || "",
        questionsFileName: sq.questionsFileName || file.name,
        questions: sq.questions?.length ? sq.questions : validated.questions,
      });
      setFormatErrors([]);
      toast.success(`Uploaded ${validated.questions.length} question(s)`);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to upload questions";
      setFormatErrors([msg]);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearUpload = () => {
    setFormatErrors([]);
    onChange({
      ...values,
      questionsFileUrl: "",
      questionsFileName: "",
      questions: [],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Survey Questions
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload Excel/CSV with columns{" "}
            <span className="font-semibold text-foreground">
              question, type, options
            </span>
            — or add questions manually.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Enabled</span>
          <Switch
            checked={values.enabled}
            onCheckedChange={(enabled) => onChange({ ...values, enabled })}
          />
        </div>
      </div>

      <div
        className={cn(
          "rounded-[8px] border border-border/60 bg-muted/20 px-4 py-3",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <p className="text-xs font-semibold text-foreground">
          How to prepare your Excel / CSV
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
          <li>
            Row 1 headers must be exactly:{" "}
            <span className="font-mono font-semibold text-foreground">
              question
            </span>
            ,{" "}
            <span className="font-mono font-semibold text-foreground">type</span>
            ,{" "}
            <span className="font-mono font-semibold text-foreground">
              options
            </span>{" "}
            (no other columns).
          </li>
          <li>
            <span className="font-medium text-foreground">question</span> — full
            question text in one cell.
          </li>
          <li>
            <span className="font-medium text-foreground">type</span> — only one
            of:{" "}
            <span className="font-mono text-foreground">text</span>,{" "}
            <span className="font-mono text-foreground">yes_no</span>,{" "}
            <span className="font-mono text-foreground">rating</span>,{" "}
            <span className="font-mono text-foreground">multi</span>.
          </li>
          <li>
            <span className="font-medium text-foreground">options</span> — only
            for <span className="font-mono text-foreground">multi</span>. Put
            all choices in one cell, separated by{" "}
            <span className="font-mono text-foreground">|</span> (example:{" "}
            <span className="font-mono text-foreground">
              Congress | BJP | Other
            </span>
            ). Leave blank for other types.
          </li>
          <li>
            Do not split options into separate columns — that breaks the file
            and will show a formatting error.
          </li>
          <li>
            Save as <span className="font-medium text-foreground">.xlsx</span>{" "}
            or <span className="font-medium text-foreground">.csv</span>, then
            upload. Or download the sample CSV first.
          </li>
        </ol>
      </div>

      <div
        className={cn(
          "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-border/70 bg-card px-4 py-8 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            {uploading ? <AppLoaderSpinner size="sm" /> : null}
            {uploading ? "Uploading…" : "Upload Excel or CSV"}
          </span>
          <span className="max-w-sm text-[11px] text-muted-foreground">
            Only columns{" "}
            <span className="font-semibold">question, type, options</span> are
            accepted.
          </span>
        </button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadSurveyQuestionsSample}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-3.5" />
            Download sample CSV
          </Button>
        </div>

        {formatErrors.length > 0 ? (
          <div className="rounded-[8px] border border-destructive/30 bg-destructive/5 px-3 py-3">
            <p className="text-xs font-semibold text-destructive">
              Upload rejected — fix these issues:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-destructive">
              {formatErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {values.questionsFileUrl || values.questionsFileName ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-border/60 bg-card px-3 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {values.questionsFileName || "Uploaded file"}
              </p>
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">{fileUrl}</span>
                </a>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {values.questions.length} question(s) loaded
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearUpload}
              aria-label="Remove uploaded questions file"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Add manually
        </p>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Type
            </Label>
            <Select
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                if (e.target.value !== "multi") setOptionsPipe("");
              }}
              options={TYPE_OPTIONS}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Question
            </Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. How satisfied are you with our service?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isMulti) {
                  e.preventDefault();
                  addQuestion();
                }
              }}
            />
          </div>
        </div>

        {isMulti ? (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Choices
            </Label>
            <Input
              value={optionsPipe}
              onChange={(e) => setOptionsPipe(e.target.value)}
              placeholder="Option A | Option B | Option C"
            />
          </div>
        ) : null}

        <Button type="button" onClick={addQuestion} className="h-10 px-4">
          <Plus className="size-4" />
          Add question
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Manual questions are saved without a Cloudinary file URL.
        </p>
      </div>

      {values.questions.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No questions yet. Upload a CSV or add one manually.
        </p>
      ) : (
        <ul className="space-y-2">
          {values.questions.map((q, index) => {
            const dynamicFields = getDynamicFieldEntries(q);
            const typeLabel =
              typeof q.type === "string" && q.type
                ? getSurveyQuestionTypeLabel(q.type) || q.type
                : null;
            const options = Array.isArray(q.options) ? q.options : [];

            return (
              <li
                key={q.id}
                className="rounded-[8px] border border-border/50 bg-card px-3.5 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    {typeLabel ? (
                      <span className="inline-block rounded-[4px] bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {typeLabel}
                      </span>
                    ) : null}
                    <p className="mt-1.5 text-sm font-medium leading-snug">
                      {getQuestionDisplayText(q)}
                    </p>
                    {dynamicFields.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {dynamicFields.map(([key, value]) => (
                          <p
                            key={key}
                            className="truncate text-[11px] text-muted-foreground"
                            title={`${key}: ${value}`}
                          >
                            <span className="font-medium text-foreground/70">
                              {key}:
                            </span>{" "}
                            {value}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {options.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {options.map((opt) => (
                          <span
                            key={opt.id}
                            className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      updateQuestions(
                        values.questions.filter((item) => item.id !== q.id)
                      )
                    }
                    aria-label="Remove question"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface ClientContactTabProps {
  surveyId?: string;
  values: SurveyClientContactConfig;
  onChange: (values: SurveyClientContactConfig) => void;
}

export function ClientContactTab({
  surveyId,
  values,
  onChange,
}: ClientContactTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formatErrors, setFormatErrors] = useState<string[]>([]);

  const handleUpload = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(lower)) {
      const msg = "Only Excel (.xlsx / .xls) or CSV files are allowed";
      setFormatErrors([msg]);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setFormatErrors([]);
    try {
      const validated = await parseAndValidateClientContactsFile(file);
      if (!validated.ok) {
        setFormatErrors(validated.errors);
        toast.error("Invalid contact file — fix the errors and try again");
        return;
      }

      if (!surveyId) {
        throw new Error("Save previous steps first to upload contacts");
      }

      // API: uploadSurveyContactFile() → POST /api/surveys/:id/contact-file
      const uploadedSurvey = await uploadSurveyContactFile(
        surveyId,
        file
      );

      onChange({
        contactFileUrl:
          uploadedSurvey.config.clientContact.contactFileUrl ||
          values.contactFileUrl,
        contactFileName:
          uploadedSurvey.config.clientContact.contactFileName || file.name,
        contacts:
          uploadedSurvey.config.clientContact.contacts?.length
            ? uploadedSurvey.config.clientContact.contacts
            : validated.contacts,
      });
      setFormatErrors([]);
      toast.success(
        `Uploaded ${validated.contacts.length} contact number(s)`
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to upload file";
      setFormatErrors([msg]);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearFile = () => {
    setFormatErrors([]);
    onChange({
      contactFileUrl: "",
      contactFileName: "",
      contacts: [],
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">
          Contact of Client
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload Excel or CSV with only one column:{" "}
          <span className="font-semibold text-foreground">contact</span>{" "}
          (phone numbers only).
        </p>
      </div>

      {/* How to format */}
      <div className="rounded-[8px] border border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          How to prepare your Excel / CSV
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
          <li>
            Open Excel or Google Sheets and create a new sheet.
          </li>
          <li>
            In cell <span className="font-medium text-foreground">A1</span>,
            type exactly:{" "}
            <span className="font-mono font-semibold text-foreground">
              contact
            </span>{" "}
            (this is the only column header allowed).
          </li>
          <li>
            From <span className="font-medium text-foreground">A2</span>{" "}
            downward, enter phone numbers only — digits, 10 to 15 characters
            (example:{" "}
            <span className="font-mono text-foreground">9876543210</span>).
          </li>
          <li>
            Do not add other columns (name, email, NUMBERS, etc.) — the file
            will be rejected.
          </li>
          <li>
            Do not use letters, spaces-only cells, or special characters in the
            number cells.
          </li>
          <li>
            Save as <span className="font-medium text-foreground">.xlsx</span>{" "}
            or <span className="font-medium text-foreground">.csv</span>, then
            upload below. You can also download the sample CSV first.
          </li>
        </ol>
      </div>

      <div className="space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-border/70 bg-card px-4 py-10 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            {uploading ? <AppLoaderSpinner size="sm" /> : null}
            {uploading ? "Uploading…" : "Upload Excel or CSV"}
          </span>
          <span className="max-w-sm text-[11px] text-muted-foreground">
            Only column <span className="font-semibold">contact</span> with
            valid phone numbers will be accepted.
          </span>
        </button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadClientContactsSample}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-3.5" />
            Download sample CSV
          </Button>
        </div>

        {formatErrors.length > 0 ? (
          <div className="rounded-[8px] border border-destructive/30 bg-destructive/5 px-3 py-3">
            <p className="text-xs font-semibold text-destructive">
              Upload rejected — fix these issues:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-destructive">
              {formatErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {values.contactFileUrl || values.contactFileName ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-border/60 bg-card px-3 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {values.contactFileName || "Uploaded file"}
              </p>
              {values.contactFileUrl ? (
                <a
                  href={getContactFileOpenUrl(values.contactFileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">
                    {getContactFileOpenUrl(values.contactFileUrl)}
                  </span>
                </a>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {values.contacts?.length
                  ? `${values.contacts.length} contact number(s) loaded`
                  : "File uploaded"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearFile}
              aria-label="Remove uploaded file"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      {values.contactFileUrl ||
      (values.contacts && values.contacts.length > 0) ? (
        <ClientContactsPreview
          fileUrl={values.contactFileUrl}
          contacts={values.contacts}
          fileName={values.contactFileName}
          compact
        />
      ) : null}
    </div>
  );
}

interface ScheduleTabProps {
  values: ScheduleFormValues;
  onChange: (values: ScheduleFormValues) => void;
  mode?: "create" | "edit";
  readOnly?: boolean;
}

/** Dedicated Create Survey step for schedule — Contact stays upload/view only */
export function ScheduleTab({
  values,
  onChange,
  mode = "create",
  readOnly = false,
}: ScheduleTabProps) {
  return (
    <SurveyScheduleFields
      values={values}
      onChange={onChange}
      mode={mode}
      readOnly={readOnly}
    />
  );
}
