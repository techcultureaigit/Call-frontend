"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Phone,
} from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useAnalyticsClientDetail,
  useAnalyticsDetails,
} from "@/modules/reports/use-reports";
import {
  KPI_FILTER_LABELS,
  type AnalyticsKpiFilterId,
} from "@/modules/reports/analytics-kpi-filter";
import type { AnalyticsDetailRow, ReportKpi } from "@/types/reports";

const OUTCOME_STYLE: Record<string, string> = {
  connected: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  missed: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
};

const SURVEY_STYLE: Record<string, string> = {
  complete: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  partially_complete: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  incomplete: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  missed: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
};

const METRIC_HINT: Record<AnalyticsKpiFilterId, string> = {
  total_calls: "All clients in this period",
  connected: "Clients with a connected call",
  survey_complete: "All required questions answered",
  survey_partial: "Some questions answered, not finished",
  survey_incomplete: "Missed call or no answers collected",
  survey_missed: "Missed call — survey never started",
  avg_duration: "Calls ranked by duration",
  missed: "Clients with a missed call",
  recording: "Calls that have a recording",
};

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

function ClientQuestionsPanel({ resultId }: { resultId: string }) {
  const { data, isLoading, isError } = useAnalyticsClientDetail(resultId, true);

  if (isLoading) {
    return (
      <div className="space-y-2 px-3 py-3">
        <Skeleton className="h-8 w-full rounded-[6px]" />
        <Skeleton className="h-8 w-full rounded-[6px]" />
        <Skeleton className="h-8 w-3/4 rounded-[6px]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="px-3 py-3 text-xs text-muted-foreground">
        Could not load question answers
      </p>
    );
  }

  const questions = data.questions ?? [];
  if (!questions.length) {
    return (
      <p className="px-3 py-3 text-xs text-muted-foreground">
        No questions for this client
      </p>
    );
  }

  return (
    <div className="px-1 py-1">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Per question
        </p>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {data.progress} answered
        </span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border/55">
        <table className="w-full min-w-[480px] text-left">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
            <tr className="border-b border-border/55 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-3 py-2">#</th>
              <th className="px-3 py-2">Question</th>
              <th className="w-24 px-3 py-2">Type</th>
              <th className="w-28 px-3 py-2">Status</th>
              <th className="px-3 py-2">Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q.questionId}
                className="border-b border-border/45 last:border-b-0"
              >
                <td className="px-3 py-2 align-top">
                  <span className="font-display inline-flex size-5 items-center justify-center rounded bg-teal-500/10 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                    {q.index}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-xs font-medium leading-snug text-foreground">
                  {q.question}
                </td>
                <td className="px-3 py-2 align-top">
                  {q.type ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {q.type}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <span
                    className={cn(
                      "inline-flex rounded-[6px] px-2 py-0.5 font-sans text-[10px] font-medium capitalize",
                      q.answered
                        ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {q.status}
                  </span>
                </td>
                <td
                  className={cn(
                    "max-w-[180px] px-3 py-2 align-top text-xs",
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
      <DialogContent className="!flex h-[min(90vh,640px)] max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-[8px]">
        {row ? (
          <>
            <DialogHeader className="shrink-0 border-b border-border/50 px-5 py-4 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
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
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
              <ClientQuestionsPanel resultId={row.id} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  row,
  onSelect,
}: {
  row: AnalyticsDetailRow;
  onSelect: () => void;
}) {
  return (
    <tr
      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/25"
      onClick={onSelect}
    >
      <td className="py-2.5 pl-3 pr-3 align-top">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Phone className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tabular-nums text-foreground">
              {row.phone}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {row.surveyName}
            </p>
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-3 align-top">
        <div className="space-y-1">
          <StatusBadge label={row.callOutcome} tone={OUTCOME_STYLE} />
          <StatusBadge label={row.surveyStatus} tone={SURVEY_STYLE} />
        </div>
      </td>
      <td className="py-2.5 pr-3 align-top text-sm tabular-nums text-foreground">
        {row.durationLabel}
      </td>
      <td className="py-2.5 pr-3 align-top text-sm tabular-nums text-foreground">
        {row.progress}
      </td>
      <td className="py-2.5 pr-3 align-top">
        <p className="text-[11px] text-muted-foreground">
          {formatDate(row.extractedAt)}
        </p>
        {row.hangupCause ? (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
            {row.hangupCause}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

export function AnalyticsKpiDetailsSheet({
  open,
  onOpenChange,
  metric,
  kpis = [],
  dateFrom,
  dateTo,
  surveyId,
  page,
  onPageChange,
  limit,
  onLimitChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: AnalyticsKpiFilterId;
  kpis?: ReportKpi[];
  dateFrom: string;
  dateTo: string;
  surveyId: string;
  page: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}) {
  const [selectedRow, setSelectedRow] = useState<AnalyticsDetailRow | null>(
    null
  );
  const [popupOpen, setPopupOpen] = useState(false);
  const pageSize = limit ?? 10;

  useEffect(() => {
    setPopupOpen(false);
    setSelectedRow(null);
  }, [metric, page, pageSize]);

  const { data, isLoading, isFetching } = useAnalyticsDetails(
    {
      from: dateFrom,
      to: dateTo,
      surveyId: surveyId === "all" ? undefined : surveyId,
      metric,
      page,
      limit: pageSize,
    },
    open
  );

  const activeKpi = useMemo(
    () => kpis.find((k) => k.id === metric) ?? null,
    [kpis, metric]
  );

  const pagination = useMemo(
    () =>
      data?.pagination ?? {
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    [data?.pagination, pageSize]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} className="sm:max-w-3xl md:max-w-4xl">
      <SheetHeader onClose={() => onOpenChange(false)}>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Card details
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {KPI_FILTER_LABELS[metric]}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {METRIC_HINT[metric]}
            </p>
          </div>
          {activeKpi ? (
            <div className="rounded-[6px] border border-brand/25 bg-brand/8 px-3 py-2 text-right">
              <p className="font-display text-xl font-semibold tabular-nums leading-none text-brand">
                {activeKpi.value}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-brand/80">
                {activeKpi.label}
              </p>
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {dateFrom} — {dateTo}
          {data?.total != null
            ? ` · ${data.total.toLocaleString()} clients`
            : ""}
        </p>
      </SheetHeader>

      <SheetContent className="px-4 sm:px-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Matching clients
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[6px]" />
            ))}
          </div>
        ) : !data?.rows.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Phone className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No records for {KPI_FILTER_LABELS[metric]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another card, date range, or survey filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[6px] border border-border/60">
            <table className="w-full min-w-160 text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2.5">Client / Survey</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Duration</th>
                  <th className="px-3 py-2.5">Answers</th>
                  <th className="px-3 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <DetailRow
                    key={row.id}
                    row={row}
                    onSelect={() => {
                      setSelectedRow(row);
                      setPopupOpen(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFetching && !isLoading ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Updating…
          </p>
        ) : null}
      </SheetContent>

      <ClientDetailPopup
        row={selectedRow}
        open={popupOpen}
        onOpenChange={(open) => {
          setPopupOpen(open);
          if (!open) setSelectedRow(null);
        }}
      />

      {data?.rows.length ? (
        <SheetFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataPagination
              meta={pagination}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              itemLabel="clients"
              variant="inline"
              className="flex-1"
            />
            {surveyId !== "all" ? (
              <Link
                href={`/survey/${surveyId}/results`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
              >
                Open all responses
                <ExternalLink className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </SheetFooter>
      ) : null}
    </Sheet>
  );
}
