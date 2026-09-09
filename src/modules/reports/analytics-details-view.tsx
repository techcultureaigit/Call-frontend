"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Mic,
  Phone,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import {
  DataTable,
  DataTableMetaChip,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SUBTEXT_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PaginatedListShell } from "@/components/shared/paginated-list-shell";
import {
  TOOLBAR_SEARCH_WIDTH_CLASS,
  TOOLBAR_FILTER_SELECT_CLASS,
  TOOLBAR_ACTION_BUTTON_CLASS,
} from "@/components/shared/toolbar-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageMeta, useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import {
  useAnalyticsClientDetail,
  useAnalyticsDetails,
  useAnalyticsKpis,
} from "@/modules/reports/use-reports";
import {
  KPI_FILTER_LABELS,
  type AnalyticsKpiFilterId,
} from "@/modules/reports/analytics-kpi-filter";
import {
  analyticsHomeHref,
  parseAnalyticsMetric,
} from "@/modules/reports/analytics-nav";
import { KPI_HINT } from "@/modules/reports/analytics-theme";
import type {
  AnalyticsClientQuestion,
  AnalyticsDetailRow,
} from "@/types/reports";

const STATUS_BADGE_CLASS =
  "bg-muted/60 text-foreground ring-1 ring-inset ring-border/50";

const OUTCOME_STYLE: Record<string, string> = {
  connected: STATUS_BADGE_CLASS,
  missed: STATUS_BADGE_CLASS,
};

const SURVEY_STYLE: Record<string, string> = {
  complete: "bg-[#2c3b59]/8 text-[#2c3b59] ring-1 ring-inset ring-[#2c3b59]/15",
  partially_complete: STATUS_BADGE_CLASS,
  incomplete: STATUS_BADGE_CLASS,
  missed: STATUS_BADGE_CLASS,
};

const METRIC_HINT: Record<AnalyticsKpiFilterId, string> = {
  total_calls: KPI_HINT.total_calls,
  connected: KPI_HINT.connected,
  survey_complete: KPI_HINT.survey_complete,
  survey_partial: KPI_HINT.survey_partial,
  survey_incomplete: KPI_HINT.survey_incomplete,
  survey_missed: KPI_HINT.missed,
  missed: KPI_HINT.missed,
  avg_duration: "Calls ranked by duration",
  recording: "Calls that have a recording",
};

const CALL_OUTCOME_OPTIONS = [
  { label: "All call outcomes", value: "all" },
  { label: "Connected", value: "connected" },
  { label: "Missed", value: "missed" },
];

const SURVEY_STATUS_OPTIONS = [
  { label: "All survey statuses", value: "all" },
  { label: "Complete", value: "complete" },
  { label: "Partially complete", value: "partially_complete" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Missed", value: "missed" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: Record<string, string>;
}) {
  const key = label.toLowerCase().replace(/\s+/g, "_");
  const display = label.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex rounded-[6px] px-2 py-0.5 font-sans text-[10px] font-medium capitalize",
        tone[key] ?? "bg-muted text-muted-foreground"
      )}
    >
      {display}
    </span>
  );
}

function QuestionDetailPopup({
  open,
  onOpenChange,
  question,
  phone,
  surveyName,
  progress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: AnalyticsClientQuestion | null;
  phone: string;
  surveyName: string;
  progress: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-[8px]">
        {question ? (
          <>
            <DialogHeader className="border-b border-border/50 px-5 py-4 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Question {question.index}
              </p>
              <DialogTitle className="mt-1.5 text-base leading-snug sm:text-lg">
                {question.question}
              </DialogTitle>
              <DialogDescription className="mt-2 text-xs">
                {phone}
                {surveyName ? ` · ${surveyName}` : ""}
                {progress ? ` · ${progress} answered` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                    question.answered
                      ? "bg-[#2c3b59]/8 text-[#2c3b59] ring-1 ring-inset ring-[#2c3b59]/15"
                      : STATUS_BADGE_CLASS
                  )}
                >
                  {question.status}
                </span>
                {question.type ? (
                  <span className="rounded-full bg-muted/70 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {question.type}
                  </span>
                ) : null}
              </div>

              <div className="rounded-[6px] border border-border/55 bg-muted/15 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Answer
                </p>
                <p
                  className={cn(
                    "mt-2 text-base leading-relaxed",
                    question.answered && question.answer
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {question.answered && question.answer
                    ? question.answer
                    : "No answer — skipped"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[6px] border border-border/45 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Client
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                    {phone}
                  </p>
                </div>
                <div className="rounded-[6px] border border-border/45 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                    {question.status}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ClientQuestionCards({
  resultId,
  phone,
  surveyName,
}: {
  resultId: string;
  phone: string;
  surveyName: string;
}) {
  const { data, isLoading, isError } = useAnalyticsClientDetail(resultId, true);
  const [selected, setSelected] = useState<AnalyticsClientQuestion | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-[6px]" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-xs text-muted-foreground">
        Could not load question answers
      </p>
    );
  }

  const questions = data.questions ?? [];
  if (!questions.length) {
    return (
      <p className="text-xs text-muted-foreground">No questions for this client</p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Per question
        </p>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {data.progress} answered
        </span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border/55">
        <table className="w-full min-w-[520px] text-left">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            <tr className="border-b border-border/55 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Question</th>
              <th className="w-24 px-3 py-2.5">Type</th>
              <th className="w-28 px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q.questionId}
                className="cursor-pointer border-b border-border/45 transition-colors last:border-b-0 hover:bg-[#2c3b59]/4"
                onClick={() => {
                  setSelected(q);
                  setPopupOpen(true);
                }}
              >
                <td className="px-3 py-2.5 align-top">
                  <span className="font-display inline-flex size-6 items-center justify-center rounded-[6px] bg-brand/10 text-[11px] font-bold text-brand">
                    {q.index}
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top text-sm font-medium leading-snug text-foreground">
                  {q.question}
                </td>
                <td className="px-3 py-2.5 align-top">
                  {q.type ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {q.type}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span
                    className={cn(
                      "inline-flex rounded-[6px] px-2 py-0.5 font-sans text-[10px] font-medium capitalize",
                      q.answered
                        ? "bg-[#2c3b59]/8 text-[#2c3b59] ring-1 ring-inset ring-[#2c3b59]/15"
                        : STATUS_BADGE_CLASS
                    )}
                  >
                    {q.status}
                  </span>
                </td>
                <td
                  className={cn(
                    "max-w-[220px] px-3 py-2.5 align-top text-sm",
                    q.answered && q.answer
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                  title={q.answered && q.answer ? q.answer : undefined}
                >
                  <span className="line-clamp-2">
                    {q.answered && q.answer ? q.answer : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuestionDetailPopup
        open={popupOpen}
        onOpenChange={(open) => {
          setPopupOpen(open);
          if (!open) setSelected(null);
        }}
        question={selected}
        phone={phone}
        surveyName={surveyName}
        progress={data.progress}
      />
    </div>
  );
}

function ClientDetailPopup({
  row,
  open,
  onOpenChange,
}: {
  row: AnalyticsDetailRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex h-[min(90vh,720px)] max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-[8px]">
        {row ? (
          <>
            <DialogHeader className="shrink-0 border-b border-border/50 px-5 py-4 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Client details
              </p>
              <DialogTitle className="mt-1.5 text-lg tabular-nums">
                {row.phone}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {row.surveyName}
              </DialogDescription>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge label={row.callOutcome} tone={OUTCOME_STYLE} />
                <StatusBadge label={row.surveyStatus} tone={SURVEY_STYLE} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Duration{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {row.durationLabel}
                  </span>
                </span>
                <span>
                  Answers{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {row.progress}
                  </span>
                </span>
                <span>{formatDate(row.extractedAt)}</span>
                {row.hangupCause ? (
                  <span className="line-clamp-1">{row.hangupCause}</span>
                ) : null}
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <ClientQuestionCards
                resultId={row.id}
                phone={row.phone}
                surveyName={row.surveyName}
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function parseProgress(progress: string) {
  const match = progress.match(/^(\d+)\/(\d+)$/);
  if (!match) return { answered: 0, total: 0, pct: 0 };
  const answered = Number(match[1]);
  const total = Number(match[2]);
  return {
    answered,
    total,
    pct: total ? Math.round((answered / total) * 100) : 0,
  };
}

function AnswerProgress({ progress }: { progress: string }) {
  const { answered, total, pct } = parseProgress(progress);
  if (!total) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const barColor =
    pct >= 100
      ? "bg-[#2c3b59]"
      : pct > 0
        ? "bg-[#6b778c]"
        : "bg-muted-foreground/30";

  return (
    <div className="flex w-full min-w-0 flex-col items-end gap-1">
      <span className="text-xs font-semibold tabular-nums text-foreground">
        {progress}
      </span>
      <div className="h-1 w-full max-w-[72px] overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ClientsTable({
  rows,
  onSelect,
  page,
  pageSize,
  embedded = false,
  fillHeight = false,
  onColumnsControlReady,
}: {
  rows: AnalyticsDetailRow[];
  onSelect: (row: AnalyticsDetailRow) => void;
  page: number;
  pageSize: number;
  embedded?: boolean;
  fillHeight?: boolean;
  onColumnsControlReady?: (control: ReactNode | null) => void;
}) {
  const startIndex = (page - 1) * pageSize;

  const columns = useMemo<DataTableColumn<AnalyticsDetailRow>[]>(
    () => [
      {
        id: "index",
        label: "#",
        hideable: false,
        pin: "start",
        showAccent: true,
        header: "#",
        cell: (_row, index) => (
          <span className="inline-flex size-7 items-center justify-center rounded-[6px] bg-muted/60 text-[11px] font-bold tabular-nums text-muted-foreground">
            {startIndex + index + 1}
          </span>
        ),
      },
      {
        id: "phone",
        header: "Phone",
        hideable: false,
        pin: "start",
        cell: (row) => (
          <div className="min-w-0">
            <p className={cn(TABLE_PRIMARY_TEXT_CLASS, "tabular-nums")}>
              {row.phone}
            </p>
            {row.hasRecording ? (
              <p className={cn(TABLE_SUBTEXT_CLASS, "inline-flex items-center gap-1")}>
                <Mic className="size-3" />
                Recording
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "survey",
        header: "Survey",
        cell: (row) => (
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground/85" title={row.surveyName}>
            {row.surveyName}
          </p>
        ),
      },
      {
        id: "call",
        header: "Call",
        cell: (row) => (
          <StatusBadge label={row.callOutcome} tone={OUTCOME_STYLE} />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <StatusBadge label={row.surveyStatus} tone={SURVEY_STYLE} />
        ),
      },
      {
        id: "duration",
        header: "Duration",
        align: "right",
        cell: (row) => (
          <DataTableMetaChip
            icon={Clock}
            label={row.durationLabel}
            tabular
            className="ml-auto"
          />
        ),
      },
      {
        id: "answers",
        header: "Answers",
        align: "right",
        cell: (row) => (
          <div className="flex justify-end">
            <AnswerProgress progress={row.progress} />
          </div>
        ),
      },
      {
        id: "when",
        header: "When",
        cell: (row) => (
          <div className="min-w-0">
            <p className={cn(TABLE_PRIMARY_TEXT_CLASS, "tabular-nums")}>
              {row.extractedAt
                ? new Date(row.extractedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className={cn(TABLE_SUBTEXT_CLASS, "tabular-nums")}>
              {row.extractedAt
                ? new Date(row.extractedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        ),
      },
    ],
    [startIndex]
  );

  return (
    <DataTable
      columnLayoutKey="analytics-details"
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      onRowClick={onSelect}
      emptyIcon={Phone}
      emptyTitle="No clients found"
      emptyDescription="Try another card, search, or filter."
      minWidthClassName="min-w-[720px]"
      fillHeight={fillHeight}
      embedded={embedded}
      onColumnsControlReady={onColumnsControlReady}
    />
  );
}

export function AnalyticsDetailsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const metric = parseAnalyticsMetric(searchParams.get("metric"));
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";
  const surveyId = searchParams.get("surveyId") || "all";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Math.max(
    1,
    Number(searchParams.get("limit") || "10") || 10
  );
  const callOutcome = searchParams.get("callOutcome") || "all";
  const surveyStatus = searchParams.get("surveyStatus") || "all";
  const searchFromUrl = searchParams.get("q") || "";

  const [search, setSearch] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(search, 300);
  const [columnsControl, setColumnsControl] = useState<ReactNode>(null);

  const [selectedRow, setSelectedRow] = useState<AnalyticsDetailRow | null>(
    null
  );
  const [popupOpen, setPopupOpen] = useState(false);

  const updateParams = (
    updates: Record<string, string | null>,
    resetPage = false
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("metric", metric);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    if (resetPage) params.delete("page");
    router.push(`/analytics/details?${params.toString()}`);
  };

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (debouncedSearch === searchFromUrl) return;
    updateParams({ q: debouncedSearch || null }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const backHref = analyticsHomeHref({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    surveyId,
  });

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: KPI_FILTER_LABELS[metric],
    breadcrumbs: [
      { label: "My Surveys", href: "/survey" },
      { label: "Analytics", href: backHref },
      { label: KPI_FILTER_LABELS[metric] },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPopupOpen(false);
    setSelectedRow(null);
  }, [metric, page, limit, dateFrom, dateTo, surveyId, debouncedSearch, callOutcome, surveyStatus]);

  const hasActiveFilters =
    Boolean(debouncedSearch) || callOutcome !== "all" || surveyStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    updateParams(
      { q: null, callOutcome: null, surveyStatus: null },
      true
    );
  };

  const { data: kpisData } = useAnalyticsKpis({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    surveyId: surveyId === "all" ? undefined : surveyId,
  });

  const { data, isLoading, isFetching } = useAnalyticsDetails(
    {
      from: dateFrom || undefined,
      to: dateTo || undefined,
      surveyId: surveyId === "all" ? undefined : surveyId,
      metric,
      page,
      limit,
      search: debouncedSearch || undefined,
      callOutcome: callOutcome !== "all" ? callOutcome : undefined,
      surveyStatus: surveyStatus !== "all" ? surveyStatus : undefined,
    },
    true
  );

  const activeKpi = useMemo(
    () => kpisData?.kpis?.find((k) => k.id === metric) ?? null,
    [kpisData?.kpis, metric]
  );

  const pagination = useMemo(() => {
    const p = data?.pagination;
    const total = p?.total ?? data?.total ?? 0;
    const pageSize = p?.limit ?? limit;
    const current = p?.page ?? page;
    const totalPages =
      p?.totalPages ?? Math.max(1, Math.ceil(total / pageSize) || 1);
    return {
      page: current,
      limit: pageSize,
      total,
      totalPages,
      hasNextPage: p?.hasNextPage ?? current < totalPages,
      hasPreviousPage: p?.hasPreviousPage ?? current > 1,
    };
  }, [data?.pagination, data?.total, limit, page]);

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("metric", metric);
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    router.push(`/analytics/details?${params.toString()}`);
  };

  const setLimit = (nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("metric", metric);
    params.delete("page");
    if (nextLimit === 10) params.delete("limit");
    else params.set("limit", String(nextLimit));
    router.push(`/analytics/details?${params.toString()}`);
  };

  const rows = data?.rows ?? [];
  const showLoader = isLoading || isFetching;

  return (
    <PageContainer size="full" className="pb-8 pt-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex min-w-0 flex-col gap-4"
      >
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to analytics
            </Link>
            <h1 className={cn(PAGE_TITLE_CLASS, "mt-2")}>
              {KPI_FILTER_LABELS[metric]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {METRIC_HINT[metric]}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {dateFrom && dateTo ? `${dateFrom} — ${dateTo}` : "All time"}
              {data?.total != null
                ? ` · ${data.total.toLocaleString()} clients`
                : ""}
              {kpisData?.surveyName ? ` · ${kpisData.surveyName}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {activeKpi ? (
              <div className="rounded-[6px] border border-border/60 bg-muted/30 px-4 py-3 text-right">
                <p className="font-display text-xl font-semibold tabular-nums leading-none text-foreground">
                  {activeKpi.value}
                </p>
                <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {activeKpi.label}
                </p>
              </div>
            ) : null}
            {surveyId !== "all" ? (
              <Link
                href={`/survey/${surveyId}/results`}
                className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-border/50 bg-card px-3 text-xs font-medium text-foreground shadow-subtle hover:border-brand/30"
              >
                Open all responses
                <ExternalLink className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        <PaginatedListShell
          unified
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search phone or survey…"
          searchAriaLabel="Search clients"
          searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
          alignControlsEnd
          columnsControl={columnsControl}
          toolbarDisabled={isLoading && rows.length === 0}
          filters={
            <>
              <SearchableSelect
                value={callOutcome}
                onChange={(value) =>
                  updateParams({ callOutcome: value }, true)
                }
                options={CALL_OUTCOME_OPTIONS}
                searchPlaceholder="Search outcomes…"
                className={TOOLBAR_FILTER_SELECT_CLASS}
                disabled={isLoading && rows.length === 0}
                aria-label="Filter by call outcome"
              />
              <SearchableSelect
                value={surveyStatus}
                onChange={(value) =>
                  updateParams({ surveyStatus: value }, true)
                }
                options={SURVEY_STATUS_OPTIONS}
                searchPlaceholder="Search statuses…"
                className={cn(TOOLBAR_FILTER_SELECT_CLASS, "lg:w-44")}
                disabled={isLoading && rows.length === 0}
                aria-label="Filter by survey status"
              />
            </>
          }
          actions={
            hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className={TOOLBAR_ACTION_BUTTON_CLASS}
              >
                <X className="size-4" />
                Clear
              </Button>
            ) : null
          }
          meta={pagination}
          itemLabel="clients"
          onPageChange={setPage}
          onLimitChange={setLimit}
        >
          {showLoader && rows.length === 0 ? (
            <div className="space-y-0 divide-y divide-border/40 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-[4px]" />
              ))}
            </div>
          ) : null}

          {!showLoader && rows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                <Phone className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {hasActiveFilters
                  ? "No clients match your search or filters"
                  : `No records for ${KPI_FILTER_LABELS[metric]}`}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try different keywords or clear filters."
                  : "Try another card or survey."}
              </p>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 rounded-[6px]"
                >
                  Clear filters
                </Button>
              ) : (
                <Link
                  href={backHref}
                  className="mt-4 text-xs font-medium text-brand hover:underline"
                >
                  Back to analytics
                </Link>
              )}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <ClientsTable
              rows={rows}
              page={pagination.page}
              pageSize={pagination.limit}
              embedded
              fillHeight
              onColumnsControlReady={setColumnsControl}
              onSelect={(row) => {
                setSelectedRow(row);
                setPopupOpen(true);
              }}
            />
          ) : null}
        </PaginatedListShell>

        <ClientDetailPopup
          row={selectedRow}
          open={popupOpen}
          onOpenChange={(open) => {
            setPopupOpen(open);
            if (!open) setSelectedRow(null);
          }}
        />
      </motion.div>
    </PageContainer>
  );
}
