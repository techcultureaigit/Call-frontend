"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TOOLBAR_SEARCH_WIDTH_CLASS } from "@/components/shared/toolbar-styles";
import type { ProviderType } from "./provider-types";

interface ProviderToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: ProviderType | "all";
  onTypeChange: (value: ProviderType | "all") => void;
  onCreateClick: () => void;
  count?: number;
  modelCount?: number;
  columnsControl?: ReactNode;
  headerOnly?: boolean;
  filtersOnly?: boolean;
  embedded?: boolean;
}

export function ProviderToolbar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  onCreateClick,
  count,
  modelCount,
  columnsControl,
  headerOnly = false,
  filtersOnly = false,
  embedded = false,
}: ProviderToolbarProps) {
  if (filtersOnly) {
    return (
      <ListToolbar
        variant="embedded"
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search provider or model..."
        searchAriaLabel="Search providers"
        searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
        alignControlsEnd
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
        columnsControl={columnsControl}
      />
    );
  }

  return (
    <div className={headerOnly ? undefined : "space-y-4"}>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className={PAGE_TITLE_CLASS}>
            Agent Providers
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

      {headerOnly ? null : (
        <ListToolbar
          variant={embedded ? "embedded" : "default"}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search provider or model..."
          searchAriaLabel="Search providers"
          searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
          alignControlsEnd
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
          columnsControl={columnsControl}
        />
      )}
    </div>
  );
}
