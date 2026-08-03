"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, HelpCircle, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, usePageMeta, usePermissions } from "@/hooks";
import { surveysModuleService } from "@/services/surveys-module.service";
import { isSurveyCompleted } from "@/lib/utils/survey-readiness";
import type { PaginatedMeta } from "@/types";
import type { Agent } from "@/types/agent";
import { DeleteSurveyDialog } from "./delete-survey-dialog";
import {
  ScheduleSurveyDialog,
  type ScheduleSurveyPayload,
} from "./schedule-survey-dialog";
import { SurveyCard } from "./survey-card";
import { SurveysPagination } from "./surveys-pagination";

const PAGE_SIZE = 9;

const EMPTY_META: PaginatedMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function SurveyListView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { canCreateSurvey } = usePermissions();
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<Agent | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "My Surveys",
    breadcrumbs: [{ label: "Surveys", href: "/survey" }, { label: "My Surveys" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const loadSurveys = useCallback(async (nextPage: number, nextSearch: string) => {
    setIsLoading(true);
    try {
      const result = await surveysModuleService.list({
        page: nextPage,
        limit: PAGE_SIZE,
        search: nextSearch.trim() || undefined,
      });
      setAgents(result.data);
      setMeta(result.meta);
    } catch {
      toast.error("Failed to load surveys");
      setAgents([]);
      setMeta(EMPTY_META);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  useEffect(() => {
    void loadSurveys(page, debouncedSearch);
  }, [page, debouncedSearch, loadSurveys]);

  const allSelected =
    agents.length > 0 && agents.every((agent) => selectedIds.has(agent.id));
  const someSelected =
    agents.some((agent) => selectedIds.has(agent.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(agents.map((agent) => agent.id)));
  };

  const handleSelectChange = (agentId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(agentId);
      else next.delete(agentId);
      return next;
    });
  };

  const handleClone = async (agent: Agent) => {
    try {
      const cloned = await surveysModuleService.duplicate(agent.id);
      toast.success(`Copied as "${cloned.name}"`);
      setSelectedIds(new Set());
      await loadSurveys(1, debouncedSearch);
      setPage(1);
    } catch {
      toast.error("Failed to copy survey");
    }
  };

  const openDelete = (agent: Agent) => {
    if (isSurveyCompleted(agent)) {
      toast.error("Completed surveys cannot be deleted");
      return;
    }
    setPendingDelete(agent);
    setDeleteOpen(true);
  };

  const openBulkDelete = () => {
    const deletable = agents.filter(
      (a) => selectedIds.has(a.id) && !isSurveyCompleted(a)
    );
    if (deletable.length === 0) {
      toast.error("Completed surveys cannot be deleted");
      return;
    }
    if (deletable.length < selectedIds.size) {
      toast.warning(
        `${selectedIds.size - deletable.length} completed survey(s) will be skipped`
      );
    }
    setSelectedIds(new Set(deletable.map((a) => a.id)));
    setPendingDelete(null);
    setDeleteOpen(true);
  };

  const openSchedule = (agent: Agent) => {
    setPendingSchedule(agent);
    setScheduleOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      const agent = pendingDelete;
      setIsDeleting(true);
      try {
        await surveysModuleService.delete(agent.id);
        setDeleteOpen(false);
        setPendingDelete(null);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(agent.id);
          return next;
        });
        toast.success(`"${agent.name}" deleted`);

        const nextPage =
          agents.length === 1 && page > 1 ? page - 1 : page;
        if (nextPage !== page) setPage(nextPage);
        else await loadSurveys(nextPage, debouncedSearch);
      } catch {
        toast.error("Failed to delete survey");
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsDeleting(true);
    try {
      const { deleted, failed } = await surveysModuleService.bulkDelete(ids);
      setDeleteOpen(false);
      setSelectedIds(new Set());

      if (deleted > 0 && failed === 0) {
        toast.success(
          `${deleted} survey${deleted === 1 ? "" : "s"} deleted`
        );
      } else if (deleted > 0) {
        toast.warning(`${deleted} deleted, ${failed} failed`);
      } else {
        toast.error("Failed to delete surveys");
        return;
      }

      const remainingOnPage = agents.length - deleted;
      const nextPage =
        remainingOnPage <= 0 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await loadSurveys(nextPage, debouncedSearch);
    } catch {
      toast.error("Failed to delete surveys");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmSchedule = async (payload: ScheduleSurveyPayload) => {
    if (!pendingSchedule) return;
    try {
      const updated = await surveysModuleService.schedule(
        pendingSchedule.id,
        payload
      );
      setAgents((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setScheduleOpen(false);
      setPendingSchedule(null);
      toast.success(`"${updated.name}" scheduled`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule survey"
      );
    }
  };

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <SidebarCollapseToggle className="mt-1" />
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  My Surveys
                </h1>
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                  Schedule any survey once all required steps are filled.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surveys by name..."
                className="h-11 rounded-[6px] border-border/50 bg-card pl-9 shadow-sm"
              />
            </div>
            {canCreateSurvey ? (
              <Button
                asChild
                className="h-11 shrink-0 rounded-[6px] px-5 shadow-sm"
              >
                <Link href="/survey/new">
                  <UserPlus className="size-4" />
                  Create New Survey
                </Link>
              </Button>
            ) : (
              <Button
                className="h-11 shrink-0 rounded-[6px] px-5 shadow-sm"
                disabled
                title="You do not have permission to create surveys"
              >
                <UserPlus className="size-4" />
                Create New Survey
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-[6px]" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No surveys found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first voice survey to get started."}
              </p>
              {!search && canCreateSurvey && (
                <Button asChild className="mt-4 rounded-[6px]">
                  <Link href="/survey/new">
                    <UserPlus className="size-4" />
                    Create New Survey
                  </Link>
                </Button>
              )}
              {!search && !canCreateSurvey && (
                <p className="mt-4 text-xs text-muted-foreground">
                  You have view-only access. Ask an admin for create permission.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border/50 bg-card/70 px-3 py-2.5 shadow-sm">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all surveys on this page"
                  />
                  <span>
                    {allSelected
                      ? "Unselect all"
                      : someSelected
                        ? `${selectedIds.size} selected`
                        : "Select all on page"}
                  </span>
                </label>
                {selectedIds.size > 0 ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={openBulkDelete}
                  >
                    Delete selected ({selectedIds.size})
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {agents.map((agent, i) => (
                  <SurveyCard
                    key={agent.id}
                    agent={agent}
                    index={i}
                    selected={selectedIds.has(agent.id)}
                    onSelectChange={handleSelectChange}
                    onClone={handleClone}
                    onDelete={openDelete}
                    onSchedule={openSchedule}
                  />
                ))}
              </div>
              <SurveysPagination
                meta={meta}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  const scroller = document.querySelector("main");
                  scroller?.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </motion.div>
      </PageContainer>

      <DeleteSurveyDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setPendingDelete(null);
        }}
        agent={pendingDelete}
        count={pendingDelete ? undefined : selectedIds.size}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <ScheduleSurveyDialog
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) setPendingSchedule(null);
        }}
        agent={pendingSchedule}
        onConfirm={confirmSchedule}
      />
    </div>
  );
}
