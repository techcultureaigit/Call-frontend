"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { SettingsSectionCard } from "../settings-section-card";
import type { ApiKeyEntry } from "@/types/settings";

interface ApiKeysSectionProps {
  values: ApiKeyEntry[];
  onChange: (values: ApiKeyEntry[]) => void;
}

export function ApiKeysSection({ values, onChange }: ApiKeysSectionProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (provider: string) =>
    setRevealed((prev) => ({ ...prev, [provider]: !prev[provider] }));

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const rotateKey = (provider: string) => {
    onChange(
      values.map((k) =>
        k.provider === provider
          ? {
              ...k,
              fullKey: k.fullKey.slice(0, 8) + "rot" + Date.now().toString(36),
              maskedKey:
                k.maskedKey.slice(0, 4) + "••••••••••••" + k.maskedKey.slice(-4),
              lastRotated: new Date().toISOString(),
            }
          : k
      )
    );
    toast.success(`${provider} key rotated`);
  };

  const deleteKey = (provider: string) => {
    onChange(values.filter((k) => k.provider !== provider));
    toast.success("API key removed");
  };

  const generateKey = () => {
    const newKey: ApiKeyEntry = {
      provider: "openai",
      label: "OpenAI",
      maskedKey: "sk-••••••••••••new1",
      fullKey: "sk-proj-new" + Date.now().toString(36),
      lastRotated: new Date().toISOString(),
      status: "active",
    };
    toast.info("Select a provider to generate a new key");
    void newKey;
  };

  return (
    <SettingsSectionCard
      title="API Keys"
      description="Manage credentials for external services"
      helpTooltip="Keys are encrypted at rest. Rotate regularly and never share in plain text."
      gradient="from-amber-500/10 to-transparent"
      action={
        <Button variant="outline" size="sm" onClick={generateKey} className="rounded-[6px]">
          <Plus className="size-3.5" />
          Generate Key
        </Button>
      }
    >
      <div className="space-y-3">
        {values.map((entry) => (
          <div
            key={entry.provider}
            className="rounded-[6px] border border-border/50 bg-muted/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{entry.label}</p>
                <Badge
                  variant="outline"
                  className={
                    entry.status === "active"
                      ? "border-emerald-500/30 text-emerald-600"
                      : ""
                  }
                >
                  {entry.status}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rotated {formatRelativeTime(entry.lastRotated)}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Input
                readOnly
                value={
                  revealed[entry.provider] ? entry.fullKey : entry.maskedKey
                }
                className="rounded-[6px] font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => toggleReveal(entry.provider)}
                className="shrink-0 rounded-lg"
              >
                {revealed[entry.provider] ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => copyKey(entry.fullKey)}
                className="shrink-0 rounded-lg"
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => rotateKey(entry.provider)}
                className="shrink-0 rounded-lg"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => deleteKey(entry.provider)}
                className="shrink-0 rounded-lg text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  );
}
