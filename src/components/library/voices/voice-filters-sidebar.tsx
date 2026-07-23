"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VOICE_LANGUAGE_OPTIONS } from "@/lib/data/mock-voices";
import { cn } from "@/lib/utils";
import type { VoiceFilters, VoiceGenderFilter } from "@/types/voice";

interface VoiceFiltersSidebarProps {
  filters: VoiceFilters;
  onChange: (filters: VoiceFilters) => void;
  onReset: () => void;
}

export function VoiceFiltersSidebar({
  filters,
  onChange,
  onReset,
}: VoiceFiltersSidebarProps) {
  return (
    <div className="rounded-[6px] border border-border/40 bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            placeholder="Search voices..."
            className="h-10 rounded-[6px] pl-9"
            aria-label="Search voices"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterGroup label="Type">
            <FilterToggle
              active={filters.voiceType === "all"}
              onClick={() => onChange({ ...filters, voiceType: "all" })}
            >
              All
            </FilterToggle>
            <FilterToggle
              active={filters.voiceType === "cloned"}
              onClick={() => onChange({ ...filters, voiceType: "cloned" })}
              icon={<span className="text-amber-500">★</span>}
            >
              Cloned
            </FilterToggle>
          </FilterGroup>

          <FilterGroup label="Gender">
            <FilterToggle
              active={filters.gender === "all"}
              onClick={() => onChange({ ...filters, gender: "all" })}
            >
              All
            </FilterToggle>
            <FilterToggle
              active={filters.gender === "masculine"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "masculine" as VoiceGenderFilter,
                })
              }
            >
              ♂
            </FilterToggle>
            <FilterToggle
              active={filters.gender === "feminine"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "feminine" as VoiceGenderFilter,
                })
              }
            >
              ♀
            </FilterToggle>
            <FilterToggle
              active={filters.gender === "neutral"}
              onClick={() =>
                onChange({
                  ...filters,
                  gender: "neutral" as VoiceGenderFilter,
                })
              }
            >
              ⚲
            </FilterToggle>
          </FilterGroup>

          <Select
            value={filters.language}
            onChange={(e) =>
              onChange({ ...filters, language: e.target.value })
            }
            options={VOICE_LANGUAGE_OPTIONS}
            placeholder="Language"
            className="h-10 w-full rounded-[6px] sm:w-45"
            aria-label="Available languages"
          />

          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-[6px]"
            onClick={onReset}
          >
            Reset
          </Button>
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
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
