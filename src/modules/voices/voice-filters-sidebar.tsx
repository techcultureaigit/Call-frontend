"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TOOLBAR_SEARCH_INPUT_CLASS,
  TOOLBAR_SEARCH_WIDTH_CLASS,
} from "@/components/shared/toolbar-styles";
import { VOICE_LANGUAGE_OPTIONS } from "@/modules/voices/voices-constants";
import { cn } from "@/lib/utils";
import type {
  VoiceFilters,
  VoiceGenderFilter,
  VoiceProvider,
} from "@/types/voice";
import { GenderIcon } from "./gender-icons";

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
  return (
    <div
      className={cn(
        embedded
          ? "shrink-0 border-b border-border/50 bg-card px-3 py-3 sm:px-4 sm:py-3.5"
          : "rounded-[6px] border border-border/40 bg-card p-4 shadow-card"
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <div className={cn("relative min-w-0", TOOLBAR_SEARCH_WIDTH_CLASS)}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            placeholder="Search voices..."
            className={TOOLBAR_SEARCH_INPUT_CLASS}
            aria-label="Search voices"
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 xl:ml-auto">
          <FilterGroup label="Provider">
            <FilterToggle
              active={!filters.source}
              onClick={() => onChange({ ...filters, source: undefined })}
              ariaLabel="All providers"
            >
              All
            </FilterToggle>
            <ProviderChip
              active={filters.source === "google"}
              onClick={() =>
                onChange({
                  ...filters,
                  source: "google" as VoiceProvider,
                })
              }
              label="Google"
              tone="google"
            />
            <ProviderChip
              active={filters.source === "elevenlabs"}
              onClick={() =>
                onChange({
                  ...filters,
                  source: "elevenlabs" as VoiceProvider,
                })
              }
              label="ElevenLabs"
              tone="elevenlabs"
            />
          </FilterGroup>

          <FilterGroup label="Gender">
            <FilterToggle
              active={filters.gender === "all"}
              onClick={() => onChange({ ...filters, gender: "all" })}
              ariaLabel="All genders"
            >
              All
            </FilterToggle>
            <GenderChip
              active={filters.gender === "masculine"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "masculine" as VoiceGenderFilter,
                })
              }
              label="Male"
              tone="male"
              icon={<GenderIcon gender="masculine" className="size-3.5" />}
            />
            <GenderChip
              active={filters.gender === "feminine"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "feminine" as VoiceGenderFilter,
                })
              }
              label="Female"
              tone="female"
              icon={<GenderIcon gender="feminine" className="size-3.5" />}
            />
            <GenderChip
              active={filters.gender === "neutral"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "neutral" as VoiceGenderFilter,
                })
              }
              label="Neutral"
              tone="neutral"
              icon={<GenderIcon gender="neutral" className="size-3.5" />}
            />
          </FilterGroup>

          <Select
            value={filters.language}
            onChange={(e) =>
              onChange({ ...filters, language: e.target.value })
            }
            options={VOICE_LANGUAGE_OPTIONS}
            placeholder="Language"
            className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-45"
            aria-label="Available languages"
          />

          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 rounded-[6px] border-border/50 bg-background/80 shadow-subtle"
            onClick={onReset}
          >
            Reset
          </Button>

          {columnsControl}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-[6px] border border-border/50 bg-muted/20 p-1">
      <span className="hidden px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:inline">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterToggle({
  active,
  onClick,
  children,
  icon,
  ariaLabel,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children?: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      title={title}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-all",
        active
          ? "brand-gradient text-brand-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

const GENDER_TONE = {
  male: {
    idle: "border-transparent text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/50",
    active: "bg-blue-500 text-white shadow-sm hover:bg-blue-500",
  },
  female: {
    idle: "border-transparent text-pink-700 hover:bg-pink-50 dark:text-pink-300 dark:hover:bg-pink-950/50",
    active: "bg-pink-500 text-white shadow-sm hover:bg-pink-500",
  },
  neutral: {
    idle: "border-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
    active: "bg-slate-600 text-white shadow-sm hover:bg-slate-600",
  },
} as const;

const PROVIDER_TONE = {
  google: {
    idle: "border-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50",
    active: "bg-emerald-500 text-white shadow-sm hover:bg-emerald-500",
  },
  elevenlabs: {
    idle: "border-transparent text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950/50",
    active: "bg-orange-500 text-white shadow-sm hover:bg-orange-500",
  },
} as const;

function GenderChip({
  active,
  onClick,
  label,
  tone,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: keyof typeof GENDER_TONE;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} voices`}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-all",
        active ? GENDER_TONE[tone].active : GENDER_TONE[tone].idle
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProviderChip({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: keyof typeof PROVIDER_TONE;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} voices`}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-all",
        active ? PROVIDER_TONE[tone].active : PROVIDER_TONE[tone].idle
      )}
    >
      <span>{label}</span>
    </button>
  );
}
