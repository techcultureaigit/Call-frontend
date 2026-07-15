"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useCampaignTemplates,
  useCampaignTemplateStats,
  useCampaignTemplateMutations,
} from "@/hooks/use-campaign-templates";
import { TEMPLATE_CATEGORY_OPTIONS } from "@/lib/constants/campaign-templates";
import { cn } from "@/lib/utils";
import { TemplatesHeader } from "./templates-header";
import { TemplatesStatsBar } from "./templates-stats-bar";
import { TemplatesSidebar } from "./templates-sidebar";
import { TemplatesGrid } from "./templates-grid";
import { TemplatePreviewDrawer } from "./template-preview-drawer";
import { CreateTemplateModal } from "./create-template-modal";
import { DeleteTemplateDialog } from "./delete-template-dialog";
import type {
  CampaignTemplate,
  TemplateCategory,
  TemplateLanguage,
  TemplateStatus,
} from "@/types/campaign-template";

export function CampaignTemplatesView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [status, setStatus] = useState<TemplateStatus | "all">("all");
  const [language, setLanguage] = useState<TemplateLanguage | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<CampaignTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] =
    useState<CampaignTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTemplate, setDeleteTemplate] =
    useState<CampaignTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: templates = [], isLoading, isFetching } = useCampaignTemplates(
    {
      search: debouncedSearch,
      category,
      status,
      language,
    }
  );

  const { data: stats, isLoading: statsLoading } = useCampaignTemplateStats();
  const {
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    archiveTemplate,
    deleteTemplate: deleteTemplateMutation,
  } = useCampaignTemplateMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Campaign Templates",
    breadcrumbs: [
      { label: "Campaigns", href: "/campaigns" },
      { label: "Templates" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const categoryCounts = useMemo(() => {
    if (!stats?.byCategory) return undefined;
    return {
      all: stats.total,
      ...stats.byCategory,
    } as Record<string, number>;
  }, [stats]);

  const hasFilters =
    Boolean(debouncedSearch) ||
    category !== "all" ||
    status !== "all" ||
    language !== "all";

  const handlePreview = useCallback((template: CampaignTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  }, []);

  const handleEdit = useCallback((template: CampaignTemplate) => {
    setEditTemplate(template);
    setCreateOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setEditTemplate(null);
    setCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback((open: boolean) => {
    setCreateOpen(open);
    if (!open) setEditTemplate(null);
  }, []);

  const handleSubmit = useCallback(
    async (payload: Parameters<typeof createTemplate.mutateAsync>[0]) => {
      if (editTemplate) {
        await updateTemplate.mutateAsync({ id: editTemplate.id, payload });
      } else {
        await createTemplate.mutateAsync(payload);
      }
      setCreateOpen(false);
      setEditTemplate(null);
    },
    [createTemplate, updateTemplate, editTemplate]
  );

  const handleDeleteOpen = useCallback((template: CampaignTemplate) => {
    setDeleteTemplate(template);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTemplate) return;
    await deleteTemplateMutation.mutateAsync(deleteTemplate.id);
    setDeleteOpen(false);
    setDeleteTemplate(null);
  }, [deleteTemplate, deleteTemplateMutation]);

  const isActionLoading =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    duplicateTemplate.isPending ||
    archiveTemplate.isPending ||
    deleteTemplateMutation.isPending;

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <TemplatesHeader
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          language={language}
          onLanguageChange={setLanguage}
          filtersOpen={filtersOpen}
          onFiltersToggle={() => setFiltersOpen((v) => !v)}
          onCreateClick={handleCreateClick}
        />

        <TemplatesStatsBar stats={stats} isLoading={statsLoading} />

        <div className="flex gap-6">
          <TemplatesSidebar
            active={category}
            onChange={setCategory}
            counts={categoryCounts}
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {TEMPLATE_CATEGORY_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    category === item.value
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/60 bg-card text-muted-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <TemplatesGrid
              templates={templates}
              isLoading={isLoading}
              onPreview={handlePreview}
              onDuplicate={(id) => duplicateTemplate.mutate(id)}
              onEdit={handleEdit}
              onArchive={(id) => archiveTemplate.mutate(id)}
              onDelete={handleDeleteOpen}
              onCreateClick={handleCreateClick}
              isActionLoading={isActionLoading}
              hasFilters={hasFilters}
            />

            {isFetching && !isLoading && (
              <div className="flex justify-center py-2">
                <div className="size-1.5 animate-pulse rounded-full bg-primary" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <TemplatePreviewDrawer
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <CreateTemplateModal
        open={createOpen}
        onOpenChange={handleCreateClose}
        onSubmit={handleSubmit}
        isLoading={createTemplate.isPending || updateTemplate.isPending}
        editTemplate={editTemplate}
      />

      <DeleteTemplateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        template={deleteTemplate}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTemplateMutation.isPending}
      />
    </PageContainer>
  );
}
