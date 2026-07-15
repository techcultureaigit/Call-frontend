"use client";

import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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

function StackColumn({
  title,
  icon,
  provider,
  model,
  voice,
  providerOptions,
  modelOptions,
  voiceOptions,
  onProviderChange,
  onModelChange,
  onVoiceChange,
}: {
  title: string;
  icon: string;
  provider: string;
  model: string;
  voice?: string;
  providerOptions: { label: string; value: string }[];
  modelOptions: { label: string; value: string }[];
  voiceOptions?: { label: string; value: string }[];
  onProviderChange: (v: string) => void;
  onModelChange: (v: string) => void;
  onVoiceChange?: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Provider</Label>
          <Select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            options={providerOptions}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Model</Label>
          <Select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            options={modelOptions}
            className="rounded-xl"
          />
        </div>
        {voiceOptions && onVoiceChange && (
          <div className="space-y-1.5">
            <Label className="text-xs">Voice</Label>
            <Select
              value={voice ?? ""}
              onChange={(e) => onVoiceChange(e.target.value)}
              options={voiceOptions}
              className="rounded-xl"
            />
          </div>
        )}
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
        >
          Advanced Settings
        </button>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            Fallback Configuration
          </summary>
          <p className="mt-2 pl-2">Configure fallback provider if primary fails.</p>
        </details>
      </div>
    </div>
  );
}

export function PersonaTab({ values, onChange }: PersonaTabProps) {
  const update = <K extends keyof AgentPersonaConfig>(
    key: K,
    val: AgentPersonaConfig[K]
  ) => onChange({ ...values, [key]: val });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="agent-name">Agent Name</Label>
        <Input
          id="agent-name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Enter agent name"
          className="max-w-md rounded-xl"
        />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/60 p-5">
        <h3 className="text-base font-semibold">Voice AI Agent Configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your agent&apos;s speech pipeline and model stack.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(
            [
              { id: "orbit", label: "Orbit", sub: "STS only" },
              { id: "quantum", label: "Quantum", sub: "STT, LLM, TTS" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => update("modelMode", mode.id)}
              className={cn(
                "rounded-2xl border-2 p-5 text-left transition-all",
                values.modelMode === mode.id
                  ? "border-primary bg-primary/5 shadow-subtle"
                  : "border-border/50 bg-muted/20 hover:border-border"
              )}
            >
              <p className="text-lg font-semibold">{mode.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{mode.sub}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Language</Label>
            <Select
              value={values.language}
              onChange={(e) => update("language", e.target.value)}
              options={AGENT_LANGUAGES}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Audio Cache Enabled</Label>
            <div className="flex gap-4 pt-2">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={
                      (opt === "Yes") === values.audioCacheEnabled
                    }
                    onChange={() =>
                      update("audioCacheEnabled", opt === "Yes")
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label className="text-xs">Livekit Inference</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Enable real-time inference via Livekit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-4 pt-2">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={
                      (opt === "Yes") === values.livekitInferenceEnabled
                    }
                    onChange={() =>
                      update("livekitInferenceEnabled", opt === "Yes")
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label className="text-xs">Max Call Duration (min)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Maximum call length before auto-disconnect</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              min={1}
              max={120}
              value={values.maxCallDurationMinutes}
              onChange={(e) =>
                update("maxCallDurationMinutes", Number(e.target.value))
              }
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <StackColumn
            title="Speech-to-Text"
            icon="🎤"
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
          />
          <StackColumn
            title="Large Language Model"
            icon="🧠"
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
          />
          <StackColumn
            title="Text-to-Speech"
            icon="🔊"
            provider={values.tts.provider}
            model={values.tts.model}
            voice={values.tts.voice}
            providerOptions={TTS_PROVIDERS}
            modelOptions={[
              { label: "Google", value: "Google" },
              { label: "Neural2", value: "neural2" },
            ]}
            voiceOptions={[
              { label: "Aakash", value: "Aakash" },
              { label: "Rachel", value: "Rachel" },
            ]}
            onProviderChange={(v) =>
              update("tts", { ...values.tts, provider: v })
            }
            onModelChange={(v) =>
              update("tts", { ...values.tts, model: v })
            }
            onVoiceChange={(v) =>
              update("tts", { ...values.tts, voice: v })
            }
          />
        </div>

        <div className="mt-6 space-y-1.5">
          <Label className="text-xs">Background Audio</Label>
          <Select
            value={values.backgroundNoise}
            onChange={(e) => update("backgroundNoise", e.target.value)}
            options={BACKGROUND_NOISE}
            className="max-w-xs rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
