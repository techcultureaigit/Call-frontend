"use client";

import { useMemo } from "react";
import { Layers } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import {
  DataTable,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SUBTEXT_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import {
  AnalyticsCard,
  AnalyticsCardActions,
} from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { AnalyticsSurveyBreakdown } from "@/types/reports";

const ROW_LIMIT = 5;

/** Survey status buckets — each call is exactly one of these; sums to total. */
function surveyStatusCounts(row: AnalyticsSurveyBreakdown) {
  return {
    complete: row.complete ?? 0,
    partial: row.partially_complete ?? 0,
    processing: row.processing ?? 0,
    incomplete: row.incomplete ?? 0,
  };
}

function pctOf(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function StatCell({
  count,
  total,
  tone,
}: {
  count: number;
  total: number;
  tone: "blue" | "yellow" | "navy" | "red";
}) {
  const pct = pctOf(count, total);
  const tones = {
    blue: "text-[#3b82f6]",
    yellow: "text-[#ca8a04]",
    navy: "text-[#2c3b59]",
    red: "text-[#dc2626]",
  };

  if (!count) {
    return <span className="text-sm tabular-nums text-muted-foreground/50">—</span>;
  }

  return (
    <div className="text-right">
      <span className={cn("text-sm font-semibold tabular-nums", tones[tone])}>
        {count}
      </span>
      <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
        {pct}%
      </p>
    </div>
  );
}

function StatusStack({ row, total }: { row: AnalyticsSurveyBreakdown; total: number }) {
  const s = surveyStatusCounts(row);
  const segments = [
    { key: "complete", count: s.complete, color: "bg-[#3b82f6]" },
    { key: "partial", count: s.partial, color: "bg-[#eab308]" },
    { key: "processing", count: s.processing, color: "bg-[#2c3b59]" },
    { key: "incomplete", count: s.incomplete, color: "bg-[#dc2626]" },
  ].filter((seg) => seg.count > 0);

  if (!total || !segments.length) {
    return <div className="h-2 rounded-full bg-muted/40" />;
  }

  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-muted/40">
      {segments.map((seg) => (
        <div
          key={seg.key}
          className={cn("h-full transition-all", seg.color)}
          style={{ width: `${pctOf(seg.count, total)}%` }}
          title={`${seg.key}: ${seg.count} (${pctOf(seg.count, total)}%)`}
        />
      ))}
    </div>
  );
}

export function SurveyBreakdownTable({
  rows,
  onSurveySelect,
  selectedSurveyId,
}: {
  rows: AnalyticsSurveyBreakdown[];
  onSurveySelect?: (surveyId: string) => void;
  selectedSurveyId?: string;
}) {
  const columns = useMemo<DataTableColumn<AnalyticsSurveyBreakdown>[]>(
    () => [
      {
        id: "rank",
        header: "#",
        hideable: false,
        pin: "start",
        cell: (_, index) => (
          <span className="inline-flex size-7 items-center justify-center rounded-[6px] bg-brand/10 text-[11px] font-bold text-brand">
            {index + 1}
          </span>
        ),
      },
      {
        id: "survey",
        header: "Survey",
        hideable: false,
        showAccent: true,
        cell: (row) => (
          <div className="min-w-0">
            <p
              className={cn(
                TABLE_PRIMARY_TEXT_CLASS,
                "line-clamp-2 leading-snug"
              )}
              title={row.name}
            >
              {row.name}
            </p>
            {(row.callsMissed ?? 0) > 0 ? (
              <p className={cn(TABLE_SUBTEXT_CLASS, "mt-1")}>
                {row.connected ?? 0} connected · {row.callsMissed} call missed
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "total",
        header: "Total",
        align: "right",
        cell: (row) => (
          <span className="text-sm font-bold tabular-nums text-foreground">
            {row.total ?? row.value}
          </span>
        ),
      },
      {
        id: "complete",
        header: "Complete",
        align: "right",
        cell: (row) => {
          const total = row.total ?? row.value;
          const s = surveyStatusCounts(row);
          return <StatCell count={s.complete} total={total} tone="blue" />;
        },
      },
      {
        id: "partial",
        header: "Partial",
        align: "right",
        cell: (row) => {
          const total = row.total ?? row.value;
          const s = surveyStatusCounts(row);
          return <StatCell count={s.partial} total={total} tone="yellow" />;
        },
      },
      {
        id: "processing",
        header: "Processing",
        align: "right",
        cell: (row) => {
          const total = row.total ?? row.value;
          const s = surveyStatusCounts(row);
          return <StatCell count={s.processing} total={total} tone="navy" />;
        },
      },
      {
        id: "incomplete",
        header: "Incomplete",
        align: "right",
        cell: (row) => {
          const total = row.total ?? row.value;
          const s = surveyStatusCounts(row);
          return <StatCell count={s.incomplete} total={total} tone="red" />;
        },
      },
      {
        id: "distribution",
        header: "Distribution",
        hideable: false,
        cell: (row) => {
          const total = row.total ?? row.value;
          return <StatusStack row={row} total={total} />;
        },
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.surveyId}
      onRowClick={
        onSurveySelect ? (row) => onSurveySelect(row.surveyId) : undefined
      }
      isRowSelected={
        selectedSurveyId
          ? (row) => row.surveyId === selectedSurveyId
          : undefined
      }
      embedded
      minWidthClassName="min-w-[880px]"
      skeletonRows={ROW_LIMIT}
    />
  );
}

export function ReportSurveyBreakdown({
  data,
  isLoading,
  onSurveySelect,
  onOpenFullPage,
}: {
  data: AnalyticsSurveyBreakdown[];
  isLoading?: boolean;
  onSurveySelect?: (surveyId: string) => void;
  onOpenFullPage?: () => void;
}) {
  const rows = useMemo(
    () =>
      [...data]
        .sort((a, b) => (b.total ?? b.value) - (a.total ?? a.value))
        .slice(0, ROW_LIMIT),
    [data]
  );

  const summary = useMemo(() => {
    const totalCalls = rows.reduce((sum, row) => sum + (row.total ?? row.value), 0);
    let complete = 0;
    let partial = 0;
    let processing = 0;
    let incomplete = 0;
    for (const row of rows) {
      const s = surveyStatusCounts(row);
      complete += s.complete;
      partial += s.partial;
      processing += s.processing;
      incomplete += s.incomplete;
    }
    return { totalCalls, complete, partial, processing, incomplete };
  }, [rows]);

  if (isLoading) {
    return (
      <AnalyticsCard
        title="By survey"
        description="Survey status per call"
        icon={Layers}
      >
        <ChartSkeleton height={240} />
      </AnalyticsCard>
    );
  }

  if (!rows.length) {
    return (
      <AnalyticsCard
        title="By survey"
        description="Survey status per call"
        icon={Layers}
      >
        <p className="py-8 text-center text-sm text-muted-foreground">
          No survey breakdown for this period
        </p>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="By survey"
      description={`Top ${Math.min(ROW_LIMIT, data.length)} of ${data.length} surveys · each row sums to 100% of total calls`}
      icon={Layers}
      contentClassName="pt-2"
      noPadding
      action={
        <AnalyticsCardActions
          badges={[
            { value: summary.totalCalls, label: "Calls" },
            { value: summary.complete, label: "Complete" },
            { value: summary.partial, label: "Partial" },
          ]}
          onViewAll={
            onOpenFullPage && data.length > rows.length
              ? onOpenFullPage
              : undefined
          }
        />
      }
    >
      <div className="mb-3 flex flex-wrap gap-3 px-4 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[#3b82f6]" /> Complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[#eab308]" /> Partial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[#2c3b59]" /> Processing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[#dc2626]" /> Incomplete
        </span>
      </div>

      <SurveyBreakdownTable rows={rows} onSurveySelect={onSurveySelect} />

      {data.length > rows.length ? (
        <p className="mt-3 px-4 text-center text-[11px] text-muted-foreground">
          Showing top {rows.length} of {data.length} surveys
          {onOpenFullPage ? (
            <>
              {" · "}
              <button
                type="button"
                onClick={onOpenFullPage}
                className="font-medium text-[#2c3b59] hover:underline"
              >
                View all surveys
              </button>
            </>
          ) : null}
        </p>
      ) : null}
    </AnalyticsCard>
  );
}
