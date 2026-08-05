"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, usePageMeta, usePermissions } from "@/hooks";
import { AGENT_LANGUAGES } from "@/lib/constants/agent-config";
import { surveysModuleService } from "@/services/surveys-module.service";
import {
  exportSurveys,
  type SurveysExportFormat,
} from "@/lib/utils/surveys-export";
import { isSurveyCompleted } from "@/lib/utils/survey-readiness";
import type { PaginatedMeta } from "@/types";
import type { Agent } from "@/types/agent";
import { DeleteSurveyDialog } from "./delete-survey-dialog";
import {
  ScheduleSurveyDialog,
  type ScheduleSurveyPayload,
} from "./schedule-survey-dialog";
import { SurveysPagination } from "./surveys-pagination";
import { SurveysTable } from "./surveys-table";

const PAGE_SIZE = 10;
const EXPORT_MAX_ROWS = 5000;

const LANGUAGE_FILTER_OPTIONS = [
  { label: "All languages", value: "all" },
  ...AGENT_LANGUAGES,
];

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
  const [language, setLanguage] = useState("all");
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { isReady, canCreateSurvey, canExportSurvey } = usePermissions();
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<Agent | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "My Surveys",
    breadcrumbs: [{ label: "Surveys", href: "/survey" }, { label: "My Surveys" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const loadSurveys = useCallback(
    async (nextPage: number, nextSearch: string, nextLanguage: string) => {
      const requestId = ++requestIdRef.current;
      const showInitialLoader = !hasLoadedRef.current;

      if (showInitialLoader) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const result = await surveysModuleService.list({
          page: nextPage,
          limit: PAGE_SIZE,
          search: nextSearch.trim() || undefined,
          language: nextLanguage !== "all" ? nextLanguage : undefined,
        });
        // Ignore stale responses from an older search/page request
        if (requestId !== requestIdRef.current) return;
        setAgents(result.data);
        setMeta(result.meta);
        hasLoadedRef.current = true;
      } catch {
        if (requestId !== requestIdRef.current) return;
        toast.error("Failed to load surveys");
        setAgents([]);
        setMeta(EMPTY_META);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, language]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  useEffect(() => {
    void loadSurveys(page, debouncedSearch, language);
  }, [page, debouncedSearch, language, loadSurveys]);

  const allSelected =
    agents.length > 0 && agents.every((agent) => selectedIds.has(agent.id));

  const handleSelectChange = (agentId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(agentId);
      else next.delete(agentId);
      return next;
    });
  };

  const selectAllOnPage = (selected = true) => {
    if (selected) {
      setSelectedIds(new Set(agents.map((agent) => agent.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleExport = async (format: SurveysExportFormat) => {
    setIsExporting(true);
    try {
      const result = await surveysModuleService.list({
        page: 1,
        limit: Math.min(Math.max(meta.total, PAGE_SIZE), EXPORT_MAX_ROWS),
        search: debouncedSearch.trim() || undefined,
        language: language !== "all" ? language : undefined,
      });
      if (result.data.length === 0) {
        toast.error("No surveys to export");
        return;
      }
      await exportSurveys(result.data, format);
      toast.success(
        `Exported ${result.data.length} survey${result.data.length === 1 ? "" : "s"}`
      );
    } catch {
      toast.error("Failed to export surveys");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClone = async (agent: Agent) => {
    try {
      const cloned = await surveysModuleService.duplicate(agent.id);
      toast.success(`Copied as "${cloned.name}"`);
      setSelectedIds(new Set());
      await loadSurveys(1, debouncedSearch, language);
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
        else await loadSurveys(nextPage, debouncedSearch, language);
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
      else await loadSurveys(nextPage, debouncedSearch, language);
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

  /** Same card loader for first load, search, and pagination refresh. */
  const showLoader = isLoading || isRefreshing;
  const hasActiveFilters = Boolean(search.trim()) || language !== "all";

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                My Surveys
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Schedule any survey once all required steps are filled.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-[6px] border border-border/50 bg-card/70 p-3 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:p-3.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surveys by name..."
                className="h-11 rounded-[6px] border-border/50 bg-background/80 pl-9 shadow-subtle"
                disabled={showLoader && agents.length === 0}
              />
            </div>
            <SearchableSelect
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_FILTER_OPTIONS}
              searchPlaceholder="Search languages…"
              className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-52"
              disabled={showLoader && agents.length === 0}
              aria-label="Filter by language"
            />
            {isReady && canExportSurvey ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-[6px] gap-1.5 border-border/50 bg-background/80 shadow-subtle hover:border-primary/30"
                    disabled={
                      isExporting ||
                      (showLoader && agents.length === 0) ||
                      meta.total === 0
                    }
                  >
                    {isExporting ? (
                      <AppLoaderSpinner size="sm" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => void handleExport("xlsx")}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="size-4 text-primary" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => void handleExport("csv")}
                    className="gap-2"
                  >
                    <FileText className="size-4 text-primary" />
                    CSV (.csv)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {!isReady || (showLoader && agents.length === 0) ? (
              <Skeleton className="h-11 w-44 shrink-0 rounded-[6px]" />
            ) : canCreateSurvey ? (
              <Button
                asChild
                className="h-11 shrink-0 rounded-[6px] px-5 shadow-brand"
              >
                <Link href="/survey/new">
                  <UserPlus className="size-4" />
                  Create New Survey
                </Link>
              </Button>
            ) : null}
          </div>

          {showLoader && agents.length === 0 ? (
            <div className="min-h-[40vh]" aria-busy="true" aria-label="Loading surveys" />
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No surveys found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try a different search term or language filter."
                  : "Create your first voice survey to get started."}
              </p>
              {!hasActiveFilters && isReady && canCreateSurvey && (
                <Button asChild className="mt-4 rounded-[6px]">
                  <Link href="/survey/new">
                    <UserPlus className="size-4" />
                    Create New Survey
                  </Link>
                </Button>
              )}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-4 rounded-[6px]"
                  onClick={() => {
                    setSearch("");
                    setLanguage("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
              {!hasActiveFilters && isReady && !canCreateSurvey && (
                <p className="mt-4 text-xs text-muted-foreground">
                  You have view-only access. Ask an admin for create permission.
                </p>
              )}
            </div>
          ) : (
            <div
              className={
                isRefreshing
                  ? "space-y-4 opacity-70 transition-opacity"
                  : "space-y-4"
              }
            >
              <SurveysTable
                agents={agents}
                selectedIds={selectedIds}
                onSelectChange={handleSelectChange}
                onSelectAll={selectAllOnPage}
                onClone={handleClone}
                onDelete={openDelete}
                onSchedule={openSchedule}
              />

              <SurveysPagination
                meta={meta}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  const scroller = document.querySelector("main");
                  scroller?.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      </PageContainer>

      <AnimatePresence>
        {selectedIds.size > 0 && !deleteOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-[6px] border border-border/70 bg-card/95 shadow-elevated backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
              />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="relative inline-flex size-8 items-center justify-center rounded-[6px] bg-primary text-xs font-bold tabular-nums text-primary-foreground shadow-brand">
                    {selectedIds.size}
                    <span
                      aria-hidden
                      className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-card"
                    />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {selectedIds.size} survey
                      {selectedIds.size === 1 ? "" : "s"} selected
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Choose an action below
                    </p>
                  </div>
                  {!allSelected ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllOnPage(true)}
                      className="h-7 shrink-0 text-xs text-primary hover:text-primary"
                    >
                      Select all
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                    className="h-7 shrink-0 text-xs text-muted-foreground"
                  >
                    <X className="size-3.5" />
                    Clear
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-9 shrink-0 gap-1.5 rounded-[6px] px-3.5 font-semibold shadow-[0_8px_18px_-8px_color-mix(in_oklch,var(--destructive)_50%,transparent)]"
                  onClick={openBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DeleteSurveyDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setPendingDelete(null);
        }}
        agent={pendingDelete}
        agents={
          pendingDelete
            ? undefined
            : agents.filter((a) => selectedIds.has(a.id))
        }
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
