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
    <aside className="space-y-5 rounded-2xl border border-border/40 bg-card p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground dark:text-foreground">
        Filters
      </h2>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Search</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            placeholder="Search voices..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Voice Type</p>
        <div className="grid grid-cols-1 gap-2">
          <FilterToggle
            active={filters.voiceType === "all"}
            onClick={() => onChange({ ...filters, voiceType: "all" })}
          >
            All Voices
          </FilterToggle>
          <FilterToggle
            active={filters.voiceType === "cloned"}
            onClick={() => onChange({ ...filters, voiceType: "cloned" })}
            icon={<span className="text-amber-500">★</span>}
          >
            Cloned Voices
          </FilterToggle>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Gender</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <FilterToggle
            active={filters.gender === "masculine"}
            onClick={() =>
              onChange({ ...filters, gender: "masculine" as VoiceGenderFilter })
            }
          >
            ♂ Masculine
          </FilterToggle>
          <FilterToggle
            active={filters.gender === "feminine"}
            onClick={() =>
              onChange({ ...filters, gender: "feminine" as VoiceGenderFilter })
            }
          >
            ♀ Feminine
          </FilterToggle>
          <FilterToggle
            active={filters.gender === "neutral"}
            onClick={() =>
              onChange({ ...filters, gender: "neutral" as VoiceGenderFilter })
            }
          >
            ⚲ Gender-neutral
          </FilterToggle>
          <FilterToggle
            active={filters.gender === "all"}
            onClick={() => onChange({ ...filters, gender: "all" })}
          >
            All
          </FilterToggle>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Available Languages
        </p>
        <Select
          value={filters.language}
          onChange={(e) => onChange({ ...filters, language: e.target.value })}
          options={VOICE_LANGUAGE_OPTIONS}
          placeholder="Select a language..."
          className="h-10 rounded-xl"
        />
      </div>

      <Button
        type="button"
        className="w-full rounded-xl"
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </aside>
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
        "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
          : "border-border/50 bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted/40 hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
