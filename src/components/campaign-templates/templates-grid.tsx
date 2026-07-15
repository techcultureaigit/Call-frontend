"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "./template-card";
import { TemplatesGridSkeleton } from "./templates-grid-skeleton";
import type { CampaignTemplate } from "@/types/campaign-template";

interface TemplatesGridProps {
  templates: CampaignTemplate[];
  isLoading?: boolean;
  onPreview: (template: CampaignTemplate) => void;
  onDuplicate: (id: string) => void;
  onEdit: (template: CampaignTemplate) => void;
  onArchive: (id: string) => void;
  onDelete: (template: CampaignTemplate) => void;
  onCreateClick: () => void;
  isActionLoading?: boolean;
  hasFilters?: boolean;
}

export function TemplatesGrid({
  templates,
  isLoading,
  onPreview,
  onDuplicate,
  onEdit,
  onArchive,
  onDelete,
  onCreateClick,
  isActionLoading,
  hasFilters,
}: TemplatesGridProps) {
  if (isLoading) {
    return <TemplatesGridSkeleton />;
  }

  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/30 via-background to-muted/20 px-6 py-16 text-center shadow-card"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-md space-y-6">
          <div className="relative mx-auto size-24">
            <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-xl" />
            <div className="relative flex size-full items-center justify-center rounded-3xl border border-border/50 bg-card/80 shadow-elevated backdrop-blur-md">
              <LayoutTemplate className="size-10 text-violet-500" />
              <Sparkles className="absolute -right-1 -top-1 size-5 text-amber-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {hasFilters
                ? "No templates match your filters"
                : "Start with your first template"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting search or category filters to find what you need."
                : "Build reusable AI call flows with surveys, voices, and prompts — ready to launch in minutes."}
            </p>
          </div>
          <Button onClick={onCreateClick} className="rounded-xl px-6">
            <Plus className="size-4" />
            Create Template
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((template, i) => (
        <TemplateCard
          key={template.id}
          template={template}
          index={i}
          onPreview={onPreview}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
          isActionLoading={isActionLoading}
        />
      ))}
    </div>
  );
}
