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
import { DEFAULT_FAREWELL, AGENT_LANGUAGES as SURVEY_LANGUAGES, getVoiceSpeedLabel, DEFAULT_VOICE_SPEED, DEFAULT_NOISE_TYPE, DEFAULT_NOISE_VOLUME, NOISE_TYPE_OPTIONS, getNoisePreviewUrl, SURVEY_QUESTION_TYPES, getSurveyQuestionTypeHint, instructionAfterTypeChange } from "@/lib/constants/agent-config";
import { listProviders } from "@/modules/providers/api";
import {
  modelNameById,
  modelsForProviderId,
  providerNameById,
  providersForType,
  resolveModelId,
  resolveProviderId,
  selectedModelValue,
} from "@/modules/providers/provider-options";
import type { ProviderItem } from "@/modules/providers/provider-types";
import { cn } from "@/lib/utils";
import {
  fetchClientContactsFromUrl,
  sanitizeContactRows,
  parseAndValidateClientContactsFile,
} from "./survey-contacts";
import type { ClientContactRow } from "./survey-contacts";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import type { AgentPromptsConfig as SurveyPromptsConfig, AgentPersonaConfig as SurveyPersonaConfig, AgentStackConfig as SurveyStackConfig, AgentSurveyQuestion as SurveyQuestion, AgentSurveyQuestionOption as SurveyQuestionOption, AgentSurveyQuestionsConfig as SurveyQuestionsConfig, AgentClientContactConfig as SurveyClientContactConfig } from "@/types/agent";
import { Users, BrainCircuit, ChevronDown, ChevronLeft, ChevronRight, GripVertical, HelpCircle, Mic, Pause, Phone, Play, Volume2, Download, ExternalLink, Plus, Trash2, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  showRequiredError?: boolean;
}

export function PromptsTab({
  values,
  onChange,
  showRequiredError = false,
}: PromptsTabProps) {
  const [greetingTouched, setGreetingTouched] = useState(false);

  const update = <K extends keyof SurveyPromptsConfig>(
    key: K,
    val: SurveyPromptsConfig[K]
  ) => onChange({ ...values, [key]: val });

  const greetingLeft = 250 - values.greeting.length;
  const greetingError =
    !values.greeting.trim() && (showRequiredError || greetingTouched);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="greeting">Survey Greetings</Label>
        <textarea
          id="greeting"
          value={values.greeting}
          onChange={(e) => update("greeting", e.target.value)}
          onBlur={() => setGreetingTouched(true)}
          rows={3}
          maxLength={250}
          aria-invalid={greetingError}
          className={cn(
            "w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            greetingError &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
          )}
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
        {greetingError ? (
          <p className="text-xs font-medium text-destructive">
            Greeting is required.
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="survey-description">Survey personal information</Label>
        <textarea
          id="survey-description"
          value={values.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Optional notes or personal information about this survey"
        />
      </div>
    </div>
  );
}

interface PersonaTabProps {
  values: SurveyPersonaConfig;
  onChange: (values: SurveyPersonaConfig) => void;
  showRequiredError?: boolean;
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
  const providerValue = stack.providerId || "";

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
          value={providerValue}
          options={providerOptions}
          onChange={(v) => {
            if (!v) {
              onChange({
                ...stack,
                providerId: "",
                modelId: "",
                provider: "",
                model: "",
                ...(stack.voice !== undefined ? { voice: "" } : {}),
              });
              return;
            }
            const opt = providerOptions.find((o) => o.value === v);
            onChange({
              ...stack,
              providerId: v,
              modelId: "",
              provider: opt?.label ?? "",
              model: "",
              ...(stack.voice !== undefined ? { voice: "" } : {}),
            });
          }}
        />
        <OptionListPicker
          label="Model"
          value={selectedModelValue(
            modelOptions,
            stack.modelId,
            stack.model
          )}
          options={modelOptions}
          onChange={(v) => {
            if (!v) {
              onChange({ ...stack, modelId: "", model: "" });
              return;
            }
            const opt = modelOptions.find((o) => o.value === v);
            onChange({
              ...stack,
              modelId: v,
              model: opt?.label ?? v,
            });
          }}
        />
        {extra}
      </div>
    </article>
  );
}

function VoiceSelectField({
  value,
  speed,
  disabled,
  onOpen,
}: {
  value: string;
  speed: number;
  disabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel hint="Opens Voice Explorer — pick the voice and its speaking speed">
        Voice &amp; speed
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
        <span className="flex shrink-0 items-center gap-2">
          {value ? (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
              {getVoiceSpeedLabel(speed)}
            </span>
          ) : null}
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </button>
    </div>
  );
}

export function PersonaTab({
  values,
  onChange,
  showRequiredError = false,
}: PersonaTabProps) {
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const nameError =
    !values.name.trim() && (showRequiredError || nameTouched);

  const update = <K extends keyof SurveyPersonaConfig>(
    key: K,
    val: SurveyPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  const noiseAudioRef = useRef<HTMLAudioElement | null>(null);
  const [noisePlaying, setNoisePlaying] = useState(false);
  const noiseType = values.noise_type || DEFAULT_NOISE_TYPE;
  const noiseVolume =
    typeof values.volume === "number" ? values.volume : DEFAULT_NOISE_VOLUME;
  const noisePreviewUrl = getNoisePreviewUrl(noiseType);

  useEffect(() => {
    const audio = noiseAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setNoisePlaying(false);
  }, [noisePreviewUrl]);

  useEffect(() => {
    const audio = noiseAudioRef.current;
    if (audio) audio.volume = Math.min(1, Math.max(0, noiseVolume));
  }, [noiseVolume]);

  useEffect(() => {
    return () => {
      const audio = noiseAudioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
    };
  }, []);

  const toggleNoisePreview = () => {
    const audio = noiseAudioRef.current;
    if (!audio || !noisePreviewUrl) return;
    if (!audio.paused) {
      audio.pause();
      setNoisePlaying(false);
      return;
    }
    audio.volume = Math.min(1, Math.max(0, noiseVolume));
    audio.loop = true;
    audio.src = noisePreviewUrl;
    void audio.play().then(
      () => setNoisePlaying(true),
      () => setNoisePlaying(false)
    );
  };

  useEffect(() => {
    let cancelled = false;
    void listProviders()
      .then((rows) => {
        if (!cancelled) setProviders(rows.filter((r) => r.isActive !== false));
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve legacy surveys → providerId + modelId once providers load
  useEffect(() => {
    if (!providers.length) return;

    const patchStack = (
      type: "stt" | "llm" | "tts",
      stack: SurveyStackConfig
    ): SurveyStackConfig | null => {
      const id = resolveProviderId(
        providers,
        type,
        stack.provider,
        stack.providerId
      );
      const mid = id
        ? resolveModelId(providers, id, stack.model, stack.modelId)
        : "";
      const name = id ? providerNameById(providers, id) : stack.provider;
      const modelName = mid
        ? modelNameById(providers, id, mid) || stack.model
        : stack.model;

      if (
        id === (stack.providerId || "") &&
        mid === (stack.modelId || "") &&
        name === stack.provider &&
        modelName === stack.model
      ) {
        return null;
      }

      return {
        ...stack,
        providerId: id,
        modelId: mid,
        provider: name || stack.provider,
        model: modelName,
      };
    };

    const nextStt = patchStack("stt", values.stt);
    const nextLlm = patchStack("llm", values.llm);
    const nextTts = patchStack("tts", values.tts);
    if (!nextStt && !nextLlm && !nextTts) return;

    onChange({
      ...values,
      stt: nextStt ?? values.stt,
      llm: nextLlm ?? values.llm,
      tts: nextTts ?? values.tts,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  const sttProviders = providersForType(providers, "stt");
  const llmProviders = providersForType(providers, "llm");
  const ttsProviders = providersForType(providers, "tts");

  const sttProviderId = values.stt.providerId || "";
  const llmProviderId = values.llm.providerId || "";
  const ttsProviderId = values.tts.providerId || "";

  const sttModels = modelsForProviderId(providers, sttProviderId);
  const llmModels = modelsForProviderId(providers, llmProviderId);
  const ttsModels = modelsForProviderId(providers, ttsProviderId);

  const language = values.language;
  const ttsProviderKey =
    values.tts.provider ||
    (ttsProviderId ? providerNameById(providers, ttsProviderId) : "google");
  const hasVoiceSource = Boolean(ttsProviderId || values.tts.provider);

  const onStackChange = (
    key: "stt" | "llm" | "tts",
    next: SurveyStackConfig
  ) => {
    if (next.providerId) {
      const name = providerNameById(providers, next.providerId);
      const models = modelsForProviderId(providers, next.providerId, false);
      const providerChanged = next.providerId !== values[key].providerId;
      const modelId = providerChanged ? "" : next.modelId || "";
      const modelOpt = models.find((m) => m.value === modelId);
      update(key, {
        ...next,
        provider: name || next.provider,
        modelId,
        model: providerChanged ? "" : modelOpt?.label || next.model || "",
        ...(key === "tts" && providerChanged
          ? { voice: "", voiceName: "", tts_speed: DEFAULT_VOICE_SPEED }
          : {}),
      });
      return;
    }
    update(key, {
      ...next,
      providerId: "",
      modelId: "",
      provider: "",
      model: "",
      ...(key === "tts"
        ? { voice: "", voiceName: "", tts_speed: DEFAULT_VOICE_SPEED }
        : {}),
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="space-y-1.5">
          <FieldLabel>Survey name</FieldLabel>
          <Input
            id="survey-name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="e.g. Customer Feedback Survey"
            aria-invalid={nameError}
            className={cn(
              "h-9",
              nameError &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
            )}
          />
          {nameError ? (
            <p className="text-xs font-medium text-destructive">
              Survey name is required.
            </p>
          ) : null}
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
                  tts: {
                    ...values.tts,
                    voice: "",
                    voiceName: "",
                    tts_speed: DEFAULT_VOICE_SPEED,
                  },
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
                Call barge in
              </p>
              <p className="text-[11px] text-muted-foreground">
                User interruption will stop the AI
              </p>
            </div>
            <Switch
              checked={values.callBargeInEnabled}
              onCheckedChange={(v) => update("callBargeInEnabled", v)}
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
            providerOptions={sttProviders}
            modelOptions={sttModels}
            onChange={(next) => onStackChange("stt", next)}
          />
          <PipelineStage
            step="02 · Reason"
            title="Language model"
            subtitle="Decide what to say next"
            icon={BrainCircuit}
            stack={values.llm}
            providerOptions={llmProviders}
            modelOptions={llmModels}
            onChange={(next) => onStackChange("llm", next)}
          />
          <PipelineStage
            step="03 · Speak"
            title="Text to speech"
            subtitle="Voice the survey’s reply"
            icon={Volume2}
            stack={values.tts}
            providerOptions={ttsProviders}
            modelOptions={ttsModels}
            onChange={(next) => onStackChange("tts", next)}
            extra={
              <VoiceSelectField
                value={values.tts.voiceName ?? ""}
                speed={values.tts.tts_speed ?? DEFAULT_VOICE_SPEED}
                disabled={!hasVoiceSource}
                onOpen={() => setVoicePickerOpen(true)}
              />
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Additional settings
          </h3>
          <p className="text-xs text-muted-foreground">
            Add ambient sound to make calls feel more natural.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-[6px] border border-border/50 bg-card p-3 shadow-card">
            <FieldLabel>Noise type</FieldLabel>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={noiseType}
                  onChange={(e) => update("noise_type", e.target.value)}
                  options={NOISE_TYPE_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                />
              </div>
              <button
                type="button"
                onClick={toggleNoisePreview}
                disabled={!noisePreviewUrl}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-muted/40 text-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={noisePlaying ? "Pause noise preview" : "Play noise preview"}
                title={noisePlaying ? "Pause preview" : "Play preview"}
              >
                {noisePlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </button>
            </div>
            <audio
              ref={noiseAudioRef}
              preload="none"
              className="hidden"
              onPlay={() => setNoisePlaying(true)}
              onPause={() => setNoisePlaying(false)}
              onEnded={() => setNoisePlaying(false)}
            />
            <p className="text-[11px] text-muted-foreground">
              {noisePreviewUrl
                ? "Click play to hear a preview. It stops when you leave this step."
                : "Select a noise type, then click play to hear it."}
            </p>
          </div>
          <div className="space-y-1.5 rounded-[6px] border border-border/50 bg-card p-3 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>Volume</FieldLabel>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
                {noiseVolume.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={noiseVolume}
              onChange={(e) => update("volume", Number(e.target.value))}
              className="w-full accent-primary"
              disabled={noiseType === "off"}
            />
          </div>
        </div>
      </section>

      <VoicePickerDialog
        open={voicePickerOpen}
        onOpenChange={setVoicePickerOpen}
        language={language}
        provider={ttsProviderKey}
        selectedVoice={values.tts.voice}
        speed={values.tts.tts_speed ?? DEFAULT_VOICE_SPEED}
        onSpeedChange={(tts_speed) =>
          update("tts", { ...values.tts, tts_speed })
        }
        onSelect={(voice, speed) =>
          update("tts", {
            ...values.tts,
            voice: voice?.id ?? "",
            voiceName: voice?.name ?? "",
            tts_speed: voice
              ? (speed ?? values.tts.tts_speed ?? DEFAULT_VOICE_SPEED)
              : DEFAULT_VOICE_SPEED,
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
  onPersist?: (values: SurveyQuestionsConfig) => void;
  showRequiredError?: boolean;
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

function splitChoiceLines(raw: string): string[] {
  if (!raw) return [""];
  return raw.split("|");
}

function joinChoiceLines(lines: string[]): string {
  return lines.join("|");
}

function ChoiceLinesEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const lines = splitChoiceLines(value);

  const setLine = (index: number, text: string) => {
    const next = [...lines];
    next[index] = text;
    onChange(joinChoiceLines(next));
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Choices
      </Label>
      {lines.map((line, index) => (
        <div key={`choice-${index}`} className="flex items-center gap-2">
          <Input
            value={line}
            onChange={(e) => setLine(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          {lines.length > 1 ? (
            <button
              type="button"
              aria-label="Remove option"
              onClick={() =>
                onChange(
                  joinChoiceLines(lines.filter((_, i) => i !== index))
                )
              }
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange(joinChoiceLines([...lines, ""]))}
        className="flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add option
      </button>
      <p className="text-[11px] text-muted-foreground">
        Multiple choice needs at least 2 options.
      </p>
    </div>
  );
}

const SKIP_DISPLAY_KEYS = new Set([
  "id",
  "_id",
  "type",
  "options",
  "question",
  "instruction",
  "conditions",
  "__v",
]);

type ThenShowDraft = {
  id: string;
  type: string;
  question: string;
  instruction: string;
  optionsPipe: string;
};

type QuestionConditionRow = {
  id: string;
  ifAnswer: string;
  thenShowQuestions: ThenShowDraft[];
};

function createSurveyQuestionId() {
  return `sq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createConditionId() {
  return `cond-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_THEN_SHOW_BASE = {
  type: "text",
  question: "",
  instruction: "",
  optionsPipe: "",
};

function createEmptyThenShow(): ThenShowDraft {
  return { ...EMPTY_THEN_SHOW_BASE, id: createSurveyQuestionId() };
}

function createEmptyCondition(): QuestionConditionRow {
  return {
    id: createConditionId(),
    ifAnswer: "",
    thenShowQuestions: [createEmptyThenShow()],
  };
}

const CONDITION_TYPE_OPTIONS = SURVEY_QUESTION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

function optionsToPipe(options: SurveyQuestionOption[] | undefined): string {
  if (!Array.isArray(options) || options.length === 0) return "";
  return options.map((opt) => String(opt?.label ?? "")).join("|");
}

function readThenShowDrafts(row: Record<string, unknown>): ThenShowDraft[] {
  if (Array.isArray(row.thenShowQuestions) && row.thenShowQuestions.length > 0) {
    return row.thenShowQuestions.map((item, index) => {
      const q = (item || {}) as {
        id?: string;
        type?: string;
        question?: string;
        instruction?: string;
        options?: SurveyQuestionOption[];
      };
      return {
        id:
          String(q.id || "").trim() ||
          `sq-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        type: String(q.type || "text").trim() || "text",
        question: String(q.question || "").trim(),
        instruction: String(q.instruction || "").trim(),
        optionsPipe: optionsToPipe(q.options),
      };
    });
  }

  const legacyQuestion = String(
    row.thenShowQuestion || row.thenShowQuestionId || ""
  ).trim();
  if (!legacyQuestion) return [createEmptyThenShow()];

  return [
    {
      id: createSurveyQuestionId(),
      type: String(row.thenShowType || "text").trim() || "text",
      question: legacyQuestion,
      instruction: String(row.thenShowInstruction || "").trim(),
      optionsPipe: optionsToPipe(
        row.thenShowOptions as SurveyQuestionOption[] | undefined
      ),
    },
  ];
}

function readConditions(q: SurveyQuestion): QuestionConditionRow[] {
  if (!Array.isArray(q.conditions)) return [];
  return q.conditions.map((row, index) => ({
    id:
      String((row as { id?: string })?.id || "").trim() ||
      `cond-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    ifAnswer: String(row?.ifAnswer || "").trim(),
    thenShowQuestions: readThenShowDrafts(
      row as unknown as Record<string, unknown>
    ),
  }));
}

function toDraftThenShow(draft: ThenShowDraft) {
  const base = {
    id: String(draft.id || "").trim() || createSurveyQuestionId(),
    type: draft.type || "text",
    question: draft.question,
    instruction: draft.instruction,
  };
  if (draft.type === "multi") {
    const parts = splitChoiceLines(draft.optionsPipe);
    return {
      ...base,
      options: parts.map((label, i) => {
        const trimmed = label.trim();
        return {
          id: `opt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          label,
          value: trimmed.toLowerCase().replace(/\s+/g, "_") || `opt_${i + 1}`,
        };
      }),
    };
  }
  return { ...base, options: [] as SurveyQuestionOption[] };
}

function toDraftCondition(row: QuestionConditionRow) {
  return {
    id: String(row.id || "").trim() || createConditionId(),
    ifAnswer: row.ifAnswer,
    thenShowQuestions: (row.thenShowQuestions.length
      ? row.thenShowQuestions
      : [createEmptyThenShow()]
    ).map(toDraftThenShow),
  };
}

function toSavedCondition(row: QuestionConditionRow) {
  const ifAnswer = row.ifAnswer.trim();
  if (!ifAnswer) return null;

  const thenShowQuestions = (row.thenShowQuestions || [])
    .map((draft) => {
      const question = draft.question.trim();
      if (!question) return null;
      const type = draft.type || "text";
      const instruction = draft.instruction.trim();
      const id = String(draft.id || "").trim() || createSurveyQuestionId();
      if (type === "multi") {
        const options = parseOptionsPipe(draft.optionsPipe);
        if (options.length < 2) return null;
        return { id, type, question, instruction, options };
      }
      return { id, type, question, instruction, options: [] as SurveyQuestionOption[] };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (thenShowQuestions.length === 0) return null;
  return { ifAnswer, thenShowQuestions };
}

function ConditionsEditor({
  enabled,
  onEnabledChange,
  conditions,
  onConditionsChange,
  parentQuestionId,
  allQuestions,
  onPersistCurrent,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  conditions: QuestionConditionRow[];
  onConditionsChange: (next: QuestionConditionRow[]) => void;
  parentQuestionId: string;
  allQuestions: SurveyQuestion[];
  onPersistCurrent?: () => void;
}) {
  const rows = conditions.length > 0 ? conditions : [{ ...createEmptyCondition() }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeThenIndex, setActiveThenIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(0, rows.length - 1));
  const row = rows[safeIndex] ?? createEmptyCondition();
  const thenShows =
    row.thenShowQuestions.length > 0
      ? row.thenShowQuestions
      : [createEmptyThenShow()];
  const safeThenIndex = Math.min(
    activeThenIndex,
    Math.max(0, thenShows.length - 1)
  );
  const thenShow = thenShows[safeThenIndex] ?? createEmptyThenShow();
  const isMultiFollowUp = thenShow.type === "multi";
  const thenTypeHint = getSurveyQuestionTypeHint(thenShow.type || "text");
  const nestedDuplicate = isDuplicateQuestionText(
    thenShow.question,
    allQuestions,
    {
      kind: "nested",
      parentId: parentQuestionId,
      condIndex: safeIndex,
      thenIndex: safeThenIndex,
    }
  );
  const thenShowIds = useMemo(
    () => thenShows.map((item, index) => item.id || `then-${index}`),
    [thenShows]
  );
  const conditionIds = useMemo(
    () => rows.map((item, index) => item.id || `cond-${index}`),
    [rows]
  );
  const thenSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const conditionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (activeIndex > rows.length - 1) {
      setActiveIndex(Math.max(0, rows.length - 1));
    }
  }, [activeIndex, rows.length]);

  useEffect(() => {
    if (activeThenIndex > thenShows.length - 1) {
      setActiveThenIndex(Math.max(0, thenShows.length - 1));
    }
  }, [activeThenIndex, thenShows.length]);

  const setRow = (patch: Partial<QuestionConditionRow>) => {
    onConditionsChange(
      rows.map((item, i) => (i === safeIndex ? { ...item, ...patch } : item))
    );
  };

  const setThenShow = (patch: Partial<ThenShowDraft>) => {
    const nextThen = thenShows.map((item, i) =>
      i === safeThenIndex ? { ...item, ...patch } : item
    );
    setRow({ thenShowQuestions: nextThen });
  };

  const reorderThenShows = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!overId || activeId === overId) return;
    const oldIndex = thenShowIds.indexOf(activeId);
    const newIndex = thenShowIds.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextThen = arrayMove(thenShows, oldIndex, newIndex);
    setRow({ thenShowQuestions: nextThen });
    setActiveThenIndex(newIndex);
  };

  const reorderConditions = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!overId || activeId === overId) return;
    const oldIndex = conditionIds.indexOf(activeId);
    const newIndex = conditionIds.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    onConditionsChange(arrayMove(rows, oldIndex, newIndex));
    setActiveIndex(newIndex);
    setActiveThenIndex(0);
  };

  return (
    <div className="space-y-3 rounded-[8px] border border-border/50 bg-card/70 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Conditional logic (show question based on answer)
        </Label>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <DndContext
              sensors={conditionSensors}
              collisionDetection={closestCenter}
              onDragEnd={reorderConditions}
            >
              <SortableContext
                items={conditionIds}
                strategy={horizontalListSortingStrategy}
              >
                {rows.map((item, index) => {
                  const label =
                    item.ifAnswer.trim() || `Condition ${index + 1}`;
                  return (
                    <SortableQuestionTab
                      key={item.id || `cond-${index}`}
                      id={item.id || `cond-${index}`}
                      index={index}
                      label={label}
                      active={index === safeIndex}
                      onSelect={() => {
                        setActiveIndex(index);
                        setActiveThenIndex(0);
                      }}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
            <button
              type="button"
              onClick={() => {
                onConditionsChange([...rows, createEmptyCondition()]);
                setActiveIndex(rows.length);
                setActiveThenIndex(0);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="size-3" />
              Add condition
            </button>
          </div>

          <div className="space-y-3 rounded-[8px] border border-border/40 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                If answer is
              </Label>
              {rows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove condition"
                  onClick={() => {
                    const next = rows.filter((_, i) => i !== safeIndex);
                    onConditionsChange(next);
                    setActiveIndex(Math.max(0, safeIndex - 1));
                    setActiveThenIndex(0);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <Input
              value={row.ifAnswer}
              onChange={(e) => setRow({ ifAnswer: e.target.value })}
              placeholder="e.g. हाँ / Yes"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Then show questions
              </p>
              <span className="text-[11px] text-muted-foreground">
                {safeThenIndex + 1} of {thenShows.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DndContext
                sensors={thenSensors}
                collisionDetection={closestCenter}
                onDragEnd={reorderThenShows}
              >
                <SortableContext
                  items={thenShowIds}
                  strategy={horizontalListSortingStrategy}
                >
                  {thenShows.map((item, index) => {
                    const label =
                      item.question.trim() || `Question ${index + 1}`;
                    return (
                      <SortableQuestionTab
                        key={item.id || `then-${index}`}
                        id={item.id || `then-${index}`}
                        index={index}
                        label={label}
                        active={index === safeThenIndex}
                        onSelect={() => setActiveThenIndex(index)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
              <button
                type="button"
                onClick={() => {
                  setRow({
                    thenShowQuestions: [
                      ...thenShows,
                      createEmptyThenShow(),
                    ],
                  });
                  setActiveThenIndex(thenShows.length);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <Plus className="size-3" />
                Add question
              </button>
            </div>

            <div className="space-y-3 rounded-[8px] border border-border/40 bg-card/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Follow-up {safeThenIndex + 1}
                </p>
                {thenShows.length > 1 ? (
                  <button
                    type="button"
                    aria-label="Remove follow-up question"
                    onClick={() => {
                      const next = thenShows.filter(
                        (_, i) => i !== safeThenIndex
                      );
                      setRow({ thenShowQuestions: next });
                      setActiveThenIndex(Math.max(0, safeThenIndex - 1));
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Type
                  </Label>
                  <Select
                    value={thenShow.type || "text"}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setThenShow({
                        type: nextType,
                        instruction: instructionAfterTypeChange(
                          thenShow.instruction,
                          nextType
                        ),
                        ...(nextType !== "multi" ? { optionsPipe: "" } : {}),
                      });
                    }}
                    options={CONDITION_TYPE_OPTIONS}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Question
                  </Label>
                  <Input
                    value={thenShow.question}
                    onChange={(e) => setThenShow({ question: e.target.value })}
                    onBlur={onPersistCurrent}
                    placeholder="e.g. How satisfied are you with our service?"
                    aria-invalid={nestedDuplicate}
                    className={nestedDuplicate ? "border-destructive" : undefined}
                  />
                  {nestedDuplicate ? (
                    <p className="text-[11px] font-medium text-destructive">
                      This question is already used as a normal or nested question.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Instruction
                </Label>
                <textarea
                  value={thenShow.instruction}
                  onChange={(e) =>
                    setThenShow({ instruction: e.target.value })
                  }
                  onBlur={onPersistCurrent}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={thenTypeHint.placeholder}
                />
              </div>

              {isMultiFollowUp ? (
                <ChoiceLinesEditor
                  value={thenShow.optionsPipe}
                  onChange={(next) => setThenShow({ optionsPipe: next })}
                />
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function getQuestionInstruction(q: SurveyQuestion): string {
  if (typeof q.instruction === "string" && q.instruction.trim()) {
    return q.instruction.trim();
  }
  return "";
}

function normalizeQuestionKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

type QuestionSkip =
  | { kind: "normal"; id: string }
  | {
      kind: "nested";
      parentId: string;
      condIndex: number;
      thenIndex: number;
    };

function collectUsedQuestionKeys(
  questions: SurveyQuestion[],
  skip?: QuestionSkip
): Set<string> {
  const keys = new Set<string>();
  questions.forEach((q) => {
    const skipNormal = skip?.kind === "normal" && skip.id === q.id;
    const mainText = String(q.question || "").trim();
    if (!skipNormal && mainText) keys.add(normalizeQuestionKey(mainText));

    (Array.isArray(q.conditions) ? q.conditions : []).forEach((row, condIndex) => {
      (Array.isArray(row.thenShowQuestions) ? row.thenShowQuestions : []).forEach(
        (item, thenIndex) => {
          const skipNested =
            skip?.kind === "nested" &&
            skip.parentId === q.id &&
            skip.condIndex === condIndex &&
            skip.thenIndex === thenIndex;
          const nestedText = String(item?.question || "").trim();
          if (!skipNested && nestedText) {
            keys.add(normalizeQuestionKey(nestedText));
          }
        }
      );
    });
  });
  return keys;
}

function isDuplicateQuestionText(
  text: string,
  questions: SurveyQuestion[],
  skip?: QuestionSkip
): boolean {
  const key = normalizeQuestionKey(text);
  if (!key) return false;
  return collectUsedQuestionKeys(questions, skip).has(key);
}

export function findDuplicateQuestionText(
  questions: SurveyQuestion[]
): string | null {
  const seen = new Set<string>();
  const visit = (raw: string) => {
    const text = raw.trim();
    const key = normalizeQuestionKey(text);
    if (!key) return null;
    if (seen.has(key)) return text;
    seen.add(key);
    return null;
  };

  for (const q of questions) {
    const dup = visit(String(q.question || ""));
    if (dup) return dup;
    for (const row of Array.isArray(q.conditions) ? q.conditions : []) {
      for (const item of Array.isArray(row.thenShowQuestions)
        ? row.thenShowQuestions
        : []) {
        const nestedDup = visit(String(item?.question || ""));
        if (nestedDup) return nestedDup;
      }
    }
  }
  return null;
}

const TYPE_OPTIONS = SURVEY_QUESTION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

function SortableQuestionTab({
  id,
  index,
  label,
  active,
  onSelect,
}: {
  id: string;
  index: number;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onClick={onSelect}
      className={cn(
        "inline-flex shrink-0 max-w-[12rem] items-center gap-1.5 truncate rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 bg-background text-muted-foreground hover:bg-muted/50",
        isDragging && "z-10 cursor-grabbing opacity-80 shadow-elevated"
      )}
      title={`${label} — drag to reorder`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3 shrink-0 opacity-70" />
      <span className="font-semibold">{index + 1}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function SurveyQuestionsTab({
  surveyId,
  values,
  onChange,
  onPersist,
  showRequiredError = false,
}: SurveyQuestionsTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formatErrors, setFormatErrors] = useState<string[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const fileUrl = getContactFileOpenUrl(values.questionsFileUrl || "");
  const questionCount = values.questions.length;
  const safeQuestionIndex = Math.min(
    activeQuestionIndex,
    Math.max(0, questionCount - 1)
  );
  const canGoPrevQuestion = safeQuestionIndex > 0;
  const canGoNextQuestion = safeQuestionIndex < questionCount - 1;
  const questionIds = useMemo(
    () => values.questions.map((item, index) => item.id || `q-${index}`),
    [values.questions]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (activeQuestionIndex > questionCount - 1) {
      setActiveQuestionIndex(Math.max(0, questionCount - 1));
    }
  }, [activeQuestionIndex, questionCount]);

  const updateQuestions = (
    questions: SurveyQuestion[],
    persist = false
  ) => {
    const next = {
      ...values,
      questionsFileUrl: "",
      questionsFileName: "",
      questions,
    };
    onChange(next);
    if (persist) onPersist?.(next);
  };

  const persistCurrent = () => {
    onPersist?.(values);
  };

  const goToPrevQuestion = () => {
    persistCurrent();
    setActiveQuestionIndex(Math.max(0, safeQuestionIndex - 1));
  };

  const goToNextQuestion = () => {
    persistCurrent();
    setActiveQuestionIndex(
      Math.min(questionCount - 1, safeQuestionIndex + 1)
    );
  };

  const selectQuestion = (index: number) => {
    if (index !== safeQuestionIndex) persistCurrent();
    setActiveQuestionIndex(index);
  };

  const addQuestion = () => {
    const nextQuestions = [
      ...values.questions,
      {
        id: `sq-${Date.now()}`,
        type: "text",
        question: "",
        instruction: "",
        options: [],
        conditions: [],
      },
    ];
    updateQuestions(nextQuestions, true);
    setActiveQuestionIndex(nextQuestions.length - 1);
  };

  const reorderQuestions = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!overId || activeId === overId) return;
    const oldIndex = questionIds.indexOf(activeId);
    const newIndex = questionIds.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextQuestions = arrayMove(values.questions, oldIndex, newIndex);
    updateQuestions(nextQuestions, true);
    setActiveQuestionIndex(newIndex);
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
      const nextValues = {
        enabled: sq.enabled,
        questionsFileUrl: sq.questionsFileUrl || "",
        questionsFileName: sq.questionsFileName || file.name,
        questions: sq.questions?.length ? sq.questions : validated.questions,
      };
      onChange(nextValues);
      onPersist?.(nextValues);
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
    const next = {
      ...values,
      questionsFileUrl: "",
      questionsFileName: "",
      questions: [],
    };
    onChange(next);
    onPersist?.(next);
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
              question, type, options, instruction, parent_question, if_answer
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
            </span>
            ,{" "}
            <span className="font-mono font-semibold text-foreground">
              instruction
            </span>
            ,{" "}
            <span className="font-mono font-semibold text-foreground">
              parent_question
            </span>
            ,{" "}
            <span className="font-mono font-semibold text-foreground">
              if_answer
            </span>
            .
          </li>
          <li>
            <span className="font-medium text-foreground">question</span> — full
            question text in one cell. Every question text must be unique.
          </li>
          <li>
            <span className="font-medium text-foreground">type</span> — only one
            of:{" "}
            <span className="font-mono text-foreground">text</span>,{" "}
            <span className="font-mono text-foreground">long</span>,{" "}
            <span className="font-mono text-foreground">yes_no</span>,{" "}
            <span className="font-mono text-foreground">rating</span>,{" "}
            <span className="font-mono text-foreground">number</span>,{" "}
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
            <span className="font-medium text-foreground">instruction</span> —
            optional description / helper text for that question. Leave blank if
            none.
          </li>
          <li>
            <span className="font-medium text-foreground">parent_question</span>{" "}
            +{" "}
            <span className="font-medium text-foreground">if_answer</span> —
            for conditional follow-ups only. Leave both blank for a normal
            top-level question. For a follow-up, put the exact parent question
            text in{" "}
            <span className="font-mono text-foreground">parent_question</span>{" "}
            and the trigger answer in{" "}
            <span className="font-mono text-foreground">if_answer</span>{" "}
            (example: <span className="font-mono text-foreground">Yes</span>).
            Same{" "}
            <span className="font-mono text-foreground">if_answer</span> can
            have multiple follow-up rows.
          </li>
          <li>
            Do not nest a follow-up under another follow-up —{" "}
            <span className="font-mono text-foreground">parent_question</span>{" "}
            must be a top-level question.
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
          showRequiredError &&
            "border-destructive/60",
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
            Columns{" "}
            <span className="font-semibold">
              question, type, options, instruction, parent_question, if_answer
            </span>{" "}
            are accepted.
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
          "space-y-3",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {questionCount > 0
              ? `Questions · ${safeQuestionIndex + 1} of ${questionCount}`
              : "Questions"}
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8"
            onClick={addQuestion}
          >
            <Plus className="size-3.5" />
            Add question
          </Button>
        </div>

        {questionCount > 0 ? (
          <div
            className={cn(
              "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
              showRequiredError && "border-destructive/60"
            )}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={reorderQuestions}
            >
              <SortableContext
                items={questionIds}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {values.questions.map((item, index) => {
                    const label =
                      (typeof item.question === "string" &&
                        item.question.trim()) ||
                      `Question ${index + 1}`;
                    return (
                      <SortableQuestionTab
                        key={item.id || questionIds[index]}
                        id={item.id || questionIds[index]}
                        index={index}
                        label={label}
                        active={index === safeQuestionIndex}
                        onSelect={() => selectQuestion(index)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {(() => {
              const q = values.questions[safeQuestionIndex];
              if (!q) return null;
              const questionTypeValue =
                typeof q.type === "string" && q.type ? q.type : "text";
              const isMultiQuestion = questionTypeValue === "multi";
              const options = Array.isArray(q.options) ? q.options : [];
              const optionsPipeValue =
                options.length > 0
                  ? options.map((opt) => String(opt?.label ?? "")).join("|")
                  : "";
              const instruction = getQuestionInstruction(q);
              const conditions = readConditions(q);
              const logicOn = conditions.length > 0;
              const typeHint = getSurveyQuestionTypeHint(questionTypeValue);
              const mainDuplicate = isDuplicateQuestionText(
                typeof q.question === "string" ? q.question : "",
                values.questions,
                { kind: "normal", id: q.id }
              );

              const patchQuestion = (patch: Partial<SurveyQuestion>) => {
                updateQuestions(
                  values.questions.map((item) =>
                    item.id === q.id ? { ...item, ...patch } : item
                  )
                );
              };

              const patchChoiceLines = (next: string) => {
                const parts = splitChoiceLines(next);
                patchQuestion({
                  options: parts.map((label, i) => {
                    const trimmed = label.trim();
                    const existing = options[i];
                    return {
                      id:
                        existing?.id ||
                        `opt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
                      label,
                      value:
                        trimmed.toLowerCase().replace(/\s+/g, "_") ||
                        existing?.value ||
                        `opt_${i + 1}`,
                    };
                  }),
                });
              };

              return (
                <div className="rounded-[8px] border border-border/50 bg-card px-3.5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            Type
                          </Label>
                          <Select
                            value={questionTypeValue}
                            onChange={(e) => {
                              const nextType = e.target.value;
                              patchQuestion({
                                type: nextType,
                                instruction: instructionAfterTypeChange(
                                  instruction,
                                  nextType
                                ),
                                ...(nextType !== "multi"
                                  ? { options: [] }
                                  : {}),
                              });
                            }}
                            onBlur={persistCurrent}
                            options={TYPE_OPTIONS}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            Question
                          </Label>
                          <Input
                            value={
                              typeof q.question === "string" ? q.question : ""
                            }
                            onChange={(e) =>
                              patchQuestion({ question: e.target.value })
                            }
                            onBlur={persistCurrent}
                            placeholder="e.g. How satisfied are you with our service?"
                            aria-invalid={mainDuplicate}
                            className={mainDuplicate ? "border-destructive" : undefined}
                          />
                          {mainDuplicate ? (
                            <p className="text-[11px] font-medium text-destructive">
                              This question is already used as a nested or normal question.
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          Instruction
                        </Label>
                        <textarea
                          value={instruction}
                          onChange={(e) =>
                            patchQuestion({ instruction: e.target.value })
                          }
                          onBlur={persistCurrent}
                          rows={2}
                          maxLength={500}
                          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder={typeHint.placeholder}
                        />
                      </div>

                      {isMultiQuestion ? (
                        <ChoiceLinesEditor
                          value={optionsPipeValue}
                          onChange={patchChoiceLines}
                        />
                      ) : null}

                      <ConditionsEditor
                        enabled={logicOn}
                        onEnabledChange={(on) => {
                          const nextConditions = on
                            ? conditions.length
                              ? conditions.map(toDraftCondition)
                              : [
                                  toDraftCondition(
                                    createEmptyCondition()
                                  ),
                                ]
                            : [];
                          patchQuestion({ conditions: nextConditions });
                        }}
                        conditions={conditions}
                        onConditionsChange={(next) =>
                          patchQuestion({
                            conditions: next.map(toDraftCondition),
                          })
                        }
                        parentQuestionId={q.id}
                        allQuestions={values.questions}
                        onPersistCurrent={persistCurrent}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        const remaining = values.questions.filter(
                          (item) => item.id !== q.id
                        );
                        updateQuestions(remaining, true);
                        setActiveQuestionIndex((prev) =>
                          Math.min(prev, Math.max(0, remaining.length - 1))
                        );
                      }}
                      aria-label="Remove question"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Question {safeQuestionIndex + 1} of {questionCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={!canGoPrevQuestion}
                  onClick={goToPrevQuestion}
                >
                  <ChevronLeft className="size-3.5" />
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={!canGoNextQuestion}
                  onClick={goToNextQuestion}
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  onClick={addQuestion}
                >
                  <Plus className="size-3.5" />
                  Add question
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-[8px] border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center",
              showRequiredError && "border-destructive/60"
            )}
          >
            <p className="text-sm text-muted-foreground">
              No questions yet. Click{" "}
              <span className="font-medium text-foreground">Add question</span>{" "}
              — each question stays editable after you add it.
            </p>
            {showRequiredError ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                At least one survey question is required.
              </p>
            ) : null}
            <Button
              type="button"
              className="mt-4 h-10 px-4"
              onClick={addQuestion}
            >
              <Plus className="size-4" />
              Add question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ClientContactTabProps {
  surveyId?: string;
  values: SurveyClientContactConfig;
  onChange: (values: SurveyClientContactConfig) => void;
  showRequiredError?: boolean;
}

export function ClientContactTab({
  surveyId,
  values,
  onChange,
  showRequiredError = false,
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

      <div
        className={cn(
          "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
          showRequiredError &&
            "border-destructive/60"
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
      {showRequiredError ? (
        <p className="-mt-3 text-xs font-medium text-destructive">
          Client contact file is required.
        </p>
      ) : null}

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
  onUnschedule?: () => void;
  isUnscheduling?: boolean;
}

/** Dedicated Create Survey step for schedule — Contact stays upload/view only */
export function ScheduleTab({
  values,
  onChange,
  mode = "create",
  readOnly = false,
  onUnschedule,
  isUnscheduling = false,
}: ScheduleTabProps) {
  return (
    <SurveyScheduleFields
      values={values}
      onChange={onChange}
      mode={mode}
      readOnly={readOnly}
      onUnschedule={onUnschedule}
      isUnscheduling={isUnscheduling}
    />
  );
}
