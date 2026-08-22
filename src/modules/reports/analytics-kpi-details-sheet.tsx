"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Mic, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { DataPagination } from "@/components/shared/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAnalyticsDetails } from "@/modules/reports/use-reports";
import {
  KPI_FILTER_LABELS,
  type AnalyticsKpiFilterId,
} from "@/modules/reports/analytics-kpi-filter";
import type { AnalyticsDetailRow } from "@/types/reports";

const OUTCOME_STYLE: Record<string, string> = {
  connected: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  disconnected: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  missed: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
};

const SURVEY_STYLE: Record<string, string> = {
  complete: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  incomplete: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  missed: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
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
  const key = label.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
        tone[key] ?? "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function DetailRow({ row }: { row: AnalyticsDetailRow }) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-2.5 pr-3 align-top">
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
      <td className="py-2.5 align-top">
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground">{formatDate(row.extractedAt)}</p>
          {row.hasRecording ? (
            <Mic className="size-3.5 shrink-0 text-indigo-500" aria-label="Has recording" />
          ) : null}
        </div>
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
  dateFrom,
  dateTo,
  surveyId,
  page,
  onPageChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: AnalyticsKpiFilterId;
  dateFrom: string;
  dateTo: string;
  surveyId: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data, isLoading, isFetching } = useAnalyticsDetails(
    {
      from: dateFrom,
      to: dateTo,
      surveyId: surveyId === "all" ? undefined : surveyId,
      metric,
      page,
      limit: 15,
    },
    open
  );

  const pagination = useMemo(
    () =>
      data?.pagination ?? {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    [data?.pagination]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} className="sm:max-w-3xl md:max-w-4xl">
      <SheetHeader onClose={() => onOpenChange(false)}>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Client details
        </p>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {KPI_FILTER_LABELS[metric]}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dateFrom} — {dateTo}
          {data?.total != null ? ` · ${data.total.toLocaleString()} records` : ""}
        </p>
      </SheetHeader>

      <SheetContent className="px-4 sm:px-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[6px]" />
            ))}
          </div>
        ) : !data?.rows.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Phone className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">No records found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another date range or survey filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[6px] border border-border/60">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2.5">Client / Survey</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Duration</th>
                  <th className="px-3 py-2.5">Answers</th>
                  <th className="px-3 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="px-3">
                {data.rows.map((row) => (
                  <DetailRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFetching && !isLoading ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Updating…</p>
        ) : null}
      </SheetContent>

      {data?.rows.length ? (
        <SheetFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataPagination
              meta={pagination}
              onPageChange={onPageChange}
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
