"use client";

import { motion } from "framer-motion";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_LANGUAGE_OPTIONS,
  TEMPLATE_STATUS_OPTIONS,
} from "@/lib/constants/campaign-templates";
import type {
  TemplateCategory,
  TemplateLanguage,
  TemplateStatus,
} from "@/types/campaign-template";

interface TemplatesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: TemplateCategory | "all";
  onCategoryChange: (value: TemplateCategory | "all") => void;
  status: TemplateStatus | "all";
  onStatusChange: (value: TemplateStatus | "all") => void;
  language: TemplateLanguage | "all";
  onLanguageChange: (value: TemplateLanguage | "all") => void;
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  onCreateClick: () => void;
}

export function TemplatesHeader({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  language,
  onLanguageChange,
  filtersOpen,
  onFiltersToggle,
  onCreateClick,
}: TemplatesHeaderProps) {
  const categoryOptions = TEMPLATE_CATEGORY_OPTIONS.filter(
    (o) => o.value !== "all"
  ).map((o) => ({ label: o.label, value: o.value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Campaign Templates
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Reusable, AI-powered call flows for enterprise campaigns. Launch
            faster with pre-built surveys, voices, and prompts.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="shrink-0 rounded-xl shadow-subtle"
        >
          <Plus className="size-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-3 shadow-card backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates by name, survey, or tag..."
            className="h-10 rounded-xl border-border/60 bg-background/80 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFiltersToggle}
            className="rounded-xl lg:hidden"
          >
            <Filter className="size-3.5" />
            Filters
          </Button>

          <div className="hidden min-w-[140px] sm:block">
            <Select
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as TemplateCategory | "all")
              }
              options={[
                { label: "All categories", value: "all" },
                ...categoryOptions,
              ]}
              className="h-10 rounded-xl"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onFiltersToggle}
            className={filtersOpen ? "rounded-xl bg-muted" : "rounded-xl"}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          <Button onClick={onCreateClick} size="sm" className="rounded-xl sm:hidden">
            <Plus className="size-3.5" />
            New
          </Button>
        </div>
      </div>

      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as TemplateStatus | "all")
              }
              options={TEMPLATE_STATUS_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Language
            </label>
            <Select
              value={language}
              onChange={(e) =>
                onLanguageChange(e.target.value as TemplateLanguage | "all")
              }
              options={TEMPLATE_LANGUAGE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as TemplateCategory | "all")
              }
              options={[
                { label: "All categories", value: "all" },
                ...categoryOptions,
              ]}
              className="rounded-xl"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
