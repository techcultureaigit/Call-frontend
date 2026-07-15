"use client";

import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CampaignAnalyticsFilters } from "@/types/campaign-analytics";

interface AnalyticsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  surveyId: string;
  onSurveyChange: (v: string) => void;
  createdBy: string;
  onCreatedByChange: (v: string) => void;
  tag: string;
  onTagChange: (v: string) => void;
  filterOptions: CampaignAnalyticsFilters;
  open: boolean;
  onToggle: () => void;
}

export function AnalyticsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  language,
  onLanguageChange,
  surveyId,
  onSurveyChange,
  createdBy,
  onCreatedByChange,
  tag,
  onTagChange,
  filterOptions,
  open,
  onToggle,
}: AnalyticsFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns in table..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Filter className="size-3.5" />
          Filters
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          <FilterField label="Status">
            <Select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              options={[
                { label: "All statuses", value: "all" },
                ...filterOptions.statuses.map((s) => ({
                  label: s.label,
                  value: s.value,
                })),
              ]}
              className="rounded-xl"
            />
          </FilterField>
          <FilterField label="Language">
            <Select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              options={[
                { label: "All languages", value: "all" },
                ...filterOptions.languages.map((l) => ({
                  label: l.label,
                  value: l.value,
                })),
              ]}
              className="rounded-xl"
            />
          </FilterField>
          <FilterField label="Survey">
            <Select
              value={surveyId}
              onChange={(e) => onSurveyChange(e.target.value)}
              options={[
                { label: "All surveys", value: "all" },
                ...filterOptions.surveys.map((s) => ({
                  label: s.name,
                  value: s.id,
                })),
              ]}
              className="rounded-xl"
            />
          </FilterField>
          <FilterField label="Created By">
            <Select
              value={createdBy}
              onChange={(e) => onCreatedByChange(e.target.value)}
              options={[
                { label: "All creators", value: "all" },
                ...filterOptions.creators.map((c) => ({
                  label: c.name,
                  value: c.id,
                })),
              ]}
              className="rounded-xl"
            />
          </FilterField>
          <FilterField label="Tags">
            <Select
              value={tag}
              onChange={(e) => onTagChange(e.target.value)}
              options={[
                { label: "All tags", value: "all" },
                ...filterOptions.tags.map((t) => ({
                  label: t,
                  value: t,
                })),
              ]}
              className="rounded-xl"
            />
          </FilterField>
        </motion.div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
