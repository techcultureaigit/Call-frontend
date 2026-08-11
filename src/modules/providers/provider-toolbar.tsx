"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProviderType } from "./provider-types";

interface ProviderToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: ProviderType | "all";
  onTypeChange: (value: ProviderType | "all") => void;
  onCreateClick: () => void;
  count?: number;
  modelCount?: number;
}

export function ProviderToolbar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  onCreateClick,
  count,
  modelCount,
}: ProviderToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Providers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Type → Provider → Models for survey speech pipeline.
            {count !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({count} providers
                {modelCount !== undefined ? ` · ${modelCount} models` : ""})
              </span>
            )}
          </p>
        </div>
        <Button onClick={onCreateClick} className="shrink-0 rounded-[6px]">
          <Plus className="size-4" />
          Add provider
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-[6px] border border-border/60 bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search provider or model..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 rounded-[6px] border-border/60 bg-muted/30 pl-9"
          />
        </div>
        <Select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as ProviderType | "all")}
          options={[
            { label: "All types", value: "all" },
            { label: "Listen (STT)", value: "stt" },
            { label: "Reason (LLM)", value: "llm" },
            { label: "Speak (TTS)", value: "tts" },
          ]}
          className="w-full rounded-[6px] sm:w-[200px]"
        />
      </div>
    </div>
  );
}
