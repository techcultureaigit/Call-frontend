"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ListToolbar } from "@/components/shared/list-toolbar";
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
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Providers
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Type → Provider → Models for survey speech pipeline.
            {count !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({count} providers
                {modelCount !== undefined ? ` · ${modelCount} models` : ""})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="h-11 shrink-0 rounded-[6px] px-5 shadow-brand"
        >
          <Plus className="size-4" />
          Add provider
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search provider or model..."
        searchAriaLabel="Search providers"
        filters={
          <Select
            value={type}
            onChange={(e) =>
              onTypeChange(e.target.value as ProviderType | "all")
            }
            options={[
              { label: "All types", value: "all" },
              { label: "Listen (STT)", value: "stt" },
              { label: "Reason (LLM)", value: "llm" },
              { label: "Speak (TTS)", value: "tts" },
            ]}
            className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-52"
            aria-label="Filter by type"
          />
        }
      />
    </div>
  );
}
