"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import {
  TOOLBAR_FILTER_SELECT_CLASS,
  TOOLBAR_OUTLINE_CONTROL_CLASS,
  TOOLBAR_SEARCH_WIDTH_CLASS,
} from "@/components/shared/toolbar-styles";
import { VOICE_LANGUAGE_OPTIONS } from "@/modules/voices/voices-constants";
import { cn } from "@/lib/utils";
import type {
  VoiceFilters,
  VoiceGenderFilter,
  VoiceProvider,
} from "@/types/voice";

const FILTER_SELECT_CLASS = TOOLBAR_FILTER_SELECT_CLASS;

const PROVIDER_OPTIONS = [
  { label: "All providers", value: "all" },
  { label: "Google", value: "google" },
  { label: "ElevenLabs", value: "elevenlabs" },
];

const GENDER_OPTIONS = [
  { label: "All genders", value: "all" },
  { label: "Male", value: "masculine", gender: "masculine" as const },
  { label: "Female", value: "feminine", gender: "feminine" as const },
  { label: "Neutral", value: "neutral", gender: "neutral" as const },
];

interface VoiceFiltersSidebarProps {
  filters: VoiceFilters;
  onChange: (filters: VoiceFilters) => void;
  onReset: () => void;
  columnsControl?: ReactNode;
  embedded?: boolean;
}

export function VoiceFiltersSidebar({
  filters,
  onChange,
  onReset,
  columnsControl,
  embedded = false,
}: VoiceFiltersSidebarProps) {
  const providerValue = filters.source ?? "all";

  return (
    <ListToolbar
      variant={embedded ? "embedded" : "default"}
      search={filters.search}
      onSearchChange={(search) => onChange({ ...filters, search })}
      searchPlaceholder="Search voices..."
      searchAriaLabel="Search voices"
      searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
      alignControlsEnd
      filters={
        <>
          <SearchableSelect
            value={providerValue}
            onChange={(value) =>
              onChange({
                ...filters,
                source:
                  value === "all" ? undefined : (value as VoiceProvider),
              })
            }
            options={PROVIDER_OPTIONS}
            searchPlaceholder="Search providers…"
            className={FILTER_SELECT_CLASS}
            aria-label="Filter by provider"
          />
          <SearchableSelect
            value={filters.gender}
            onChange={(value) =>
              onChange({
                ...filters,
                gender: value as VoiceGenderFilter,
              })
            }
            options={GENDER_OPTIONS}
            searchPlaceholder="Search genders…"
            className={FILTER_SELECT_CLASS}
            aria-label="Filter by gender"
          />
          <SearchableSelect
            value={filters.language}
            onChange={(value) =>
              onChange({ ...filters, language: value })
            }
            options={VOICE_LANGUAGE_OPTIONS}
            searchPlaceholder="Search languages…"
            className={cn(FILTER_SELECT_CLASS, "lg:w-40")}
            aria-label="Filter by language"
          />
        </>
      }
      actions={
        <Button
          type="button"
          variant="outline"
          className={TOOLBAR_OUTLINE_CONTROL_CLASS}
          onClick={onReset}
        >
          Reset
        </Button>
      }
      columnsControl={columnsControl}
    />
  );
}
