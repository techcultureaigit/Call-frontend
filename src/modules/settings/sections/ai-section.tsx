"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import type { AiConfigurationSettings } from "@/types/settings";

interface AiSectionProps {
  values: AiConfigurationSettings;
  onChange: (values: AiConfigurationSettings) => void;
}

export function AiSection({ values, onChange }: AiSectionProps) {
  const update = <K extends keyof AiConfigurationSettings>(
    key: K,
    val: AiConfigurationSettings[K]
  ) => onChange({ ...values, [key]: val });

  return (
    <SettingsSectionCard
      title="AI Configuration"
      description="Model parameters and conversation behavior"
      helpTooltip="Fine-tune how AI agents conduct calls, handle retries, and maintain context."
      gradient="from-violet-500/10 to-transparent"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="AI Provider">
          <Select
            value={values.provider}
            onChange={(e) => update("provider", e.target.value)}
            options={[
              { label: "OpenAI", value: "openai" },
              { label: "Anthropic", value: "anthropic" },
              { label: "Google Gemini", value: "google" },
              { label: "Azure OpenAI", value: "azure" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Model Selection">
          <Select
            value={values.model}
            onChange={(e) => update("model", e.target.value)}
            options={[
              { label: "GPT-4o", value: "gpt-4o" },
              { label: "GPT-4o Mini", value: "gpt-4o-mini" },
              { label: "Claude Sonnet", value: "claude-sonnet" },
              { label: "Gemini Pro", value: "gemini-pro" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField
          label="Temperature"
          hint={`${values.temperature} — higher = more creative`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={values.temperature}
            onChange={(e) => update("temperature", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </SettingsField>
        <SettingsField label="Max Tokens">
          <Input
            type="number"
            value={values.maxTokens}
            onChange={(e) => update("maxTokens", Number(e.target.value))}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Response Style">
          <Select
            value={values.responseStyle}
            onChange={(e) => update("responseStyle", e.target.value)}
            options={[
              { label: "Professional", value: "professional" },
              { label: "Friendly", value: "friendly" },
              { label: "Concise", value: "concise" },
              { label: "Empathetic", value: "empathetic" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Retry Count">
          <Input
            type="number"
            min={0}
            max={10}
            value={values.retryCount}
            onChange={(e) => update("retryCount", Number(e.target.value))}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Fallback Model">
          <Select
            value={values.fallbackModel}
            onChange={(e) => update("fallbackModel", e.target.value)}
            options={[
              { label: "GPT-4o Mini", value: "gpt-4o-mini" },
              { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
              { label: "Claude Haiku", value: "claude-haiku" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
      </div>

      <div className="flex items-center justify-between rounded-[6px] border border-border/40 bg-muted/20 px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Conversation Memory</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Retain context across multi-turn survey conversations
          </p>
        </div>
        <Switch
          checked={values.conversationMemory}
          onCheckedChange={(c) => update("conversationMemory", c)}
        />
      </div>
    </SettingsSectionCard>
  );
}
