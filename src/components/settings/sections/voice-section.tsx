"use client";

import { toast } from "sonner";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import { SettingsStatusBadge } from "../settings-status-badge";
import type { VoiceProviderSettings } from "@/types/settings";

interface VoiceSectionProps {
  values: VoiceProviderSettings;
  onChange: (values: VoiceProviderSettings) => void;
}

export function VoiceSection({ values, onChange }: VoiceSectionProps) {
  const update = <K extends keyof VoiceProviderSettings>(
    key: K,
    val: VoiceProviderSettings[K]
  ) => onChange({ ...values, [key]: val });

  const preview = () => toast.success("Playing voice preview…");

  return (
    <SettingsSectionCard
      title="Voice Providers"
      description="Text-to-speech and call voice settings"
      helpTooltip="Configure the default voice engine for AI-powered outbound calls."
      gradient="from-fuchsia-500/10 to-transparent"
      action={<SettingsStatusBadge connected={values.connected} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Default Provider">
          <Select
            value={values.defaultProvider}
            onChange={(e) => update("defaultProvider", e.target.value)}
            options={[
              { label: "ElevenLabs", value: "elevenlabs" },
              { label: "Azure Speech", value: "azure" },
              { label: "Google Cloud TTS", value: "google" },
              { label: "Amazon Polly", value: "polly" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Voice Selection">
          <Select
            value={values.voiceId}
            onChange={(e) => update("voiceId", e.target.value)}
            options={[
              { label: "Rachel (Professional)", value: "rachel-pro" },
              { label: "Adam (Warm)", value: "adam-warm" },
              { label: "Bella (Energetic)", value: "bella-energy" },
              { label: "James (Neutral)", value: "james-neutral" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField
          label="Speech Speed"
          hint={`${values.speechSpeed.toFixed(1)}x`}
        >
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={values.speechSpeed}
            onChange={(e) => update("speechSpeed", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </SettingsField>
        <SettingsField
          label="Speech Pitch"
          hint={`${values.speechPitch.toFixed(1)}x`}
        >
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={values.speechPitch}
            onChange={(e) => update("speechPitch", Number(e.target.value))}
            className="w-full accent-primary"
          />
        </SettingsField>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Language Support</Label>
        <div className="flex flex-wrap gap-2">
          {["en", "es", "fr", "hi", "de"].map((lang) => {
            const active = values.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  const langs = active
                    ? values.languages.filter((l) => l !== lang)
                    : [...values.languages, lang];
                  update("languages", langs);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <Button variant="outline" onClick={preview} className="rounded-[6px]">
        <Play className="size-3.5" />
        Voice Preview
      </Button>
    </SettingsSectionCard>
  );
}
