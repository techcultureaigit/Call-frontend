"use client";

/**
 * survey-list.tsx
 * Survey list page. Route: /survey
 *
 * API calls in this file:
 *   listSurveys()         → GET    /api/surveys
 *   duplicateSurvey()     → POST   /api/surveys/:id/duplicate
 *   deleteSurvey()        → DELETE /api/surveys/:id
 *   bulkDeleteSurveys()   → DELETE /api/surveys/:id  (per selected id)
 *   scheduleSurvey()      → POST   /api/surveys/:id/schedule
 *
 * Export (no API): exportSurveys() — client-side CSV/xlsx
 *   (uses listSurveys data fetched above)
 */

import {
  listSurveys,
  duplicateSurvey,
  deleteSurvey,
  bulkDeleteSurveys,
  scheduleSurvey,
  unscheduleSurvey,
} from "./api";
import { DeleteSurveyDialog } from "./survey-dialogs";
import {
  ScheduleSurveyDialog,
  SurveyStatusBadge,
  type ScheduleSurveyPayload,
} from "./survey-dialogs";
import { exportSurveys } from "./survey-export";
import type { SurveysExportFormat } from "./survey-export";
import { getSurveySchedule, getSurveyDisplayStatus, isSurveyCompleted, isSurveyReadyToSchedule, isSurveyScheduled } from "./survey-lib";
import { PageContainer } from "@/components/layout";
import { DataTable, DataTableActionButton, DataTableActionDivider, DataTableActionGroup, DataTableMetaChip } from "@/components/shared/data-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import { PaginatedListShell } from "@/components/shared/paginated-list-shell";
import { AppLoader, AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions, usePageMeta, usePaginatedList } from "@/hooks";
import { getAgentLanguageLabel as getSurveyLanguageLabel, AGENT_LANGUAGES as SURVEY_LANGUAGES } from "@/lib/constants/agent-config";
import { cn } from "@/lib/utils";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import type { Agent as Survey } from "@/types/agent";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, CalendarClock, ClipboardList, Clock3, Copy, Eye, Languages, MessagesSquare, Mic2, Pencil, Bot, Download, FileSpreadsheet, FileText, HelpCircle, Trash2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

interface SurveysTableProps {
  surveys: Survey[];
  selectedIds: Set<string>;
  onSelectChange: (agentId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onClone: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
  onSchedule: (survey: Survey) => void;
  onUnschedule: (survey: Survey) => void;
  unschedulingId?: string | null;
}

/* --- Table: one row per survey (used only on list page) --- */

export function SurveysTable({
  surveys,
  selectedIds,
  onSelectChange,
  onSelectAll,
  onClone,
  onDelete,
  onSchedule,
  onUnschedule,
  unschedulingId,
}: SurveysTableProps) {
  const router = useRouter();
  const {
    isReady,
    canCreateSurvey,
    canUpdateSurvey,
    canDeleteSurvey,
  } = usePermissions();

  const allSelected =
    surveys.length > 0 && surveys.every((survey) => selectedIds.has(survey.id));
  const someSelected =
    surveys.some((survey) => selectedIds.has(survey.id)) && !allSelected;

  const columns = useMemo<DataTableColumn<Survey>[]>(
    () => [
      {
        id: "select",
        label: "Select",
        hideable: false,
        pin: "start",
        showAccent: true,
        header: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            aria-label="Select all surveys on this page"
            className="size-4"
          />
        ),
        cell: (survey) => (
          <Checkbox
            checked={selectedIds.has(survey.id)}
            onChange={(e) => onSelectChange(survey.id, e.target.checked)}
            aria-label={`Select ${survey.name}`}
            className="size-4"
          />
        ),
      },
      {
        id: "name",
        header: "Survey",
        hideable: false,
        pin: "start",
        cell: (survey) => (
          <div className="min-w-0">
            <p
              className="truncate font-display text-[15px] font-semibold tracking-tight text-foreground"
              title={survey.name}
            >
              {survey.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              Voice survey · {formatSurveyCreatedAt(survey.createdAt)}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (survey) => (
          <SurveyStatusBadge
            status={getSurveyDisplayStatus(survey)}
            withDot
            size="md"
          />
        ),
      },
      {
        id: "language",
        header: "Language",
        cell: (survey) => (
          <DataTableMetaChip
            icon={Languages}
            label={getSurveyLanguageLabel(
              survey.config.persona.language || survey.language
            )}
          />
        ),
      },
      {
        id: "voice",
        header: "Voice",
        cell: (survey) => (
          <DataTableMetaChip
            icon={Mic2}
            label={survey.config.persona.tts.voiceName?.trim() || "—"}
          />
        ),
      },
      {
        id: "maxDuration",
        header: "Duration",
        cell: (survey) => (
          <DataTableMetaChip
            icon={Clock3}
            label={`${survey.config.persona.maxCallDurationMinutes} min`}
            tabular
          />
        ),
      },
      {
        id: "conversations",
        header: "Conversations",
        cell: (survey) => {
          const count = survey.conversationCount;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1",
                count > 0
                  ? "bg-primary/10 text-primary ring-primary/15"
                  : "bg-muted/60 text-muted-foreground ring-border/50"
              )}
            >
              <MessagesSquare className="size-3.5 opacity-70" />
              {count}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        hideable: false,
        pin: "end",
        cell: (survey) => {
          const locked = isSurveyCompleted(survey);
          const canSchedule =
            canUpdateSurvey &&
            !locked &&
            !isSurveyScheduled(survey) &&
            isSurveyReadyToSchedule(survey);

          return (
            <div className="flex items-center justify-end gap-2">
              {locked ? (
                <Link
                  href={`/survey/${survey.id}/results`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-primary/25 bg-primary/8 px-2.5 text-[11px] font-semibold text-primary shadow-subtle transition-all duration-200 hover:border-primary/40 hover:bg-primary/14 hover:shadow-brand"
                  aria-label="View responses"
                >
                  Response
                </Link>
              ) : null}

              <DataTableActionGroup>
                <DataTableActionButton
                  label="View details"
                  href={`/survey/${survey.id}`}
                  tone="sky"
                >
                  <Eye className="size-3.5" />
                </DataTableActionButton>
                {canUpdateSurvey && !locked && (
                  <DataTableActionButton
                    label="Edit survey"
                    href={`/survey/${survey.id}/configure`}
                    tone="emerald"
                  >
                    <Pencil className="size-3.5" />
                  </DataTableActionButton>
                )}
                {canSchedule ? (
                  <DataTableActionButton
                    label="Schedule survey"
                    onClick={() => onSchedule(survey)}
                    tone="amber"
                  >
                    <CalendarClock className="size-3.5" />
                  </DataTableActionButton>
                ) : null}
                {canUpdateSurvey && isSurveyScheduled(survey) ? (
                  <DataTableActionButton
                    label="Unschedule survey"
                    onClick={() => onUnschedule(survey)}
                    tone="danger"
                    className={
                      unschedulingId === survey.id
                        ? "pointer-events-none opacity-60"
                        : undefined
                    }
                  >
                    {unschedulingId === survey.id ? (
                      <AppLoaderSpinner size="sm" />
                    ) : (
                      <Ban className="size-3.5" />
                    )}
                  </DataTableActionButton>
                ) : null}
                {isReady && canCreateSurvey && (
                  <DataTableActionButton
                    label="Copy full survey"
                    onClick={() => onClone(survey)}
                    tone="teal"
                  >
                    <Copy className="size-3.5" />
                  </DataTableActionButton>
                )}
                {canDeleteSurvey && !locked && (
                  <>
                    <DataTableActionDivider />
                    <DataTableActionButton
                      label="Delete survey"
                      onClick={() => onDelete(survey)}
                      tone="danger"
                    >
                      <Trash2 className="size-3.5" />
                    </DataTableActionButton>
                  </>
                )}
              </DataTableActionGroup>
            </div>
          );
        },
      },
    ],
    [
      allSelected,
      someSelected,
      selectedIds,
      onSelectChange,
      onSelectAll,
      onClone,
      onDelete,
      onSchedule,
      onUnschedule,
      unschedulingId,
      isReady,
      canCreateSurvey,
      canUpdateSurvey,
      canDeleteSurvey,
    ]
  );

  return (
    <DataTable
      columnLayoutKey="surveys"
      columns={columns}
      data={surveys}
      getRowId={(survey) => survey.id}
      onRowClick={(survey) => router.push(`/survey/${survey.id}`)}
      emptyIcon={ClipboardList}
      emptyTitle="No surveys found"
      emptyDescription="Create a survey or adjust your filters."
      minWidthClassName="min-w-245"
      isRowSelected={(survey) => selectedIds.has(survey.id)}
      fillHeight
    />
  );
}

const PAGE_SIZE = 10;
const EXPORT_MAX_ROWS = 5000;

const LANGUAGE_FILTER_OPTIONS = [
  { label: "All languages", value: "all" },
  ...SURVEY_LANGUAGES,
];

const SURVEY_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
];

/* --- Page: /survey — list + bulk actions --- */

export function SurveyListView() {
  const [language, setLanguage] = useState("all");
  const [status, setStatus] = useState("all");
  const { isReady, canCreateSurvey, canExportSurvey } = usePermissions();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Survey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<Survey | null>(null);
  const [unschedulingId, setUnschedulingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchPage = useCallback(
    async ({
      page,
      limit,
      search,
    }: {
      page: number;
      limit: number;
      search: string;
    }) => {
      try {
        // API: listSurveys() → GET /api/surveys
        return await listSurveys({
          page,
          limit,
          search: search || undefined,
          language: language !== "all" ? language : undefined,
          status: status !== "all" ? status : undefined,
        });
      } catch (error) {
        throw error;
      }
    },
    [language, status]
  );

  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    data: surveys,
    meta,
    isLoading,
    isRefreshing,
    reload,
  } = usePaginatedList<Survey>({
    pageSize: PAGE_SIZE,
    fetchPage,
    resetPageWhen: [language, status],
    onError: () => toast.error("Failed to load surveys"),
  });

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "My Surveys",
    breadcrumbs: [{ label: "Surveys", href: "/survey" }, { label: "My Surveys" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, language, status]);

  const allSelected =
    surveys.length > 0 && surveys.every((survey) => selectedIds.has(survey.id));

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
      setSelectedIds(new Set(surveys.map((survey) => survey.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleExport = async (format: SurveysExportFormat) => {
    setIsExporting(true);
    try {
      // API: listSurveys() → GET /api/surveys?includeQuestions=true  (full questions for export)
      const result = await listSurveys({
        page: 1,
        limit: Math.min(Math.max(meta.total, PAGE_SIZE), EXPORT_MAX_ROWS),
        search: debouncedSearch.trim() || undefined,
        language: language !== "all" ? language : undefined,
        status: status !== "all" ? status : undefined,
        includeQuestions: true,
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

  const handleClone = async (survey: Survey) => {
    try {
      // API: duplicateSurvey() → POST /api/surveys/:id/duplicate
      const cloned = await duplicateSurvey(survey.id);
      toast.success(`Copied as "${cloned.name}"`);
      setSelectedIds(new Set());
      await reload();
      setPage(1);
    } catch {
      toast.error("Failed to copy survey");
    }
  };

  const openDelete = (survey: Survey) => {
    if (isSurveyCompleted(survey)) {
      toast.error("Completed surveys cannot be deleted");
      return;
    }
    setPendingDelete(survey);
    setDeleteOpen(true);
  };

  const openBulkDelete = () => {
    const deletable = surveys.filter(
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

  const openSchedule = (survey: Survey) => {
    setPendingSchedule(survey);
    setScheduleOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      const survey = pendingDelete;
      setIsDeleting(true);
      try {
        // API: deleteSurvey() → DELETE /api/surveys/:id
        await deleteSurvey(survey.id);
        setDeleteOpen(false);
        setPendingDelete(null);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(survey.id);
          return next;
        });
        toast.success(`"${survey.name}" deleted`);

        const nextPage =
          surveys.length === 1 && page > 1 ? page - 1 : page;
        if (nextPage !== page) setPage(nextPage);
        else {
          await reload();
          setPage(nextPage);
        }
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
      // API: bulkDeleteSurveys() → DELETE /api/surveys/:id  (once per id)
      const { deleted, failed } = await bulkDeleteSurveys(ids);
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

      const remainingOnPage = surveys.length - deleted;
      const nextPage =
        remainingOnPage <= 0 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await reload();
    } catch {
      toast.error("Failed to delete surveys");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmSchedule = async (payload: ScheduleSurveyPayload) => {
    if (!pendingSchedule) return;
    try {
      // API: scheduleSurvey() → POST /api/surveys/:id/schedule
      const updated = await scheduleSurvey(
        pendingSchedule.id,
        payload
      );
      setScheduleOpen(false);
      setPendingSchedule(null);
      toast.success(`"${updated.name}" scheduled`);
      await reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule survey"
      );
    }
  };

  const handleUnschedule = async (survey: Survey) => {
    if (unschedulingId) return;
    setUnschedulingId(survey.id);
    try {
      await unscheduleSurvey(survey.id);
      toast.success(`"${survey.name}" unscheduled`);
      await reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unschedule survey"
      );
    } finally {
      setUnschedulingId(null);
    }
  };

  /** Same card loader for first load, search, and pagination refresh. */
  const showLoader = isLoading || isRefreshing;
  const hasActiveFilters =
    Boolean(search.trim()) || language !== "all" || status !== "all";

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer
        size="full"
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex shrink-0 items-start justify-between gap-4">
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

          <PaginatedListShell
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search surveys by name..."
            searchAriaLabel="Search surveys"
            toolbarDisabled={showLoader && surveys.length === 0}
            filters={
              <>
                <SearchableSelect
                  value={status}
                  onChange={setStatus}
                  options={SURVEY_STATUS_FILTER_OPTIONS}
                  searchPlaceholder="Search statuses…"
                  className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-44"
                  disabled={showLoader && surveys.length === 0}
                  aria-label="Filter by status"
                />
                <SearchableSelect
                  value={language}
                  onChange={setLanguage}
                  options={LANGUAGE_FILTER_OPTIONS}
                  searchPlaceholder="Search languages…"
                  className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-52"
                  disabled={showLoader && surveys.length === 0}
                  aria-label="Filter by language"
                />
              </>
            }
            actions={
              <>
                {isReady && canExportSurvey ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 shrink-0 rounded-[6px] gap-1.5 border-border/50 bg-background/80 shadow-subtle hover:border-primary/30"
                        disabled={
                          isExporting ||
                          (showLoader && surveys.length === 0) ||
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
                {!isReady || (showLoader && surveys.length === 0) ? (
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
              </>
            }
            meta={meta}
            itemLabel="surveys"
            onPageChange={setPage}
          >
          {showLoader ? (
            <AppLoader
              variant="section"
              label="Loading surveys"
              hint="Fetching latest data"
            />
          ) : null}
          {!showLoader && surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No surveys found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try a different search, status, or language filter."
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
                    setStatus("all");
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
          ) : surveys.length > 0 ? (
              <SurveysTable
                surveys={surveys}
                selectedIds={selectedIds}
                onSelectChange={handleSelectChange}
                onSelectAll={selectAllOnPage}
                onClone={handleClone}
                onDelete={openDelete}
                onSchedule={openSchedule}
                onUnschedule={handleUnschedule}
                unschedulingId={unschedulingId}
              />
          ) : null}
          </PaginatedListShell>
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
        survey={pendingDelete}
        surveys={
          pendingDelete
            ? undefined
            : surveys.filter((a) => selectedIds.has(a.id))
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
        survey={pendingSchedule}
        onConfirm={confirmSchedule}
      />
    </div>
  );
}
