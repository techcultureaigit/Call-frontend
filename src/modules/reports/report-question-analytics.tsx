"use client";

import { useMemo } from "react";
import { HelpCircle } from "lucide-react";
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
import type { AnalyticsQuestionDetail } from "@/types/reports";

const DASHBOARD_ROW_LIMIT = 5;

function rateBar(pct: number) {
  if (pct >= 70) return "bg-[#2c3b59]";
  if (pct >= 40) return "bg-[#6b778c]";
  return "bg-[#94a3b8]";
}

function rateBadge(pct: number) {
  if (pct >= 70) return "bg-[#2c3b59]/10 text-[#2c3b59]";
  if (pct >= 40) return "bg-[#6b778c]/10 text-[#6b778c]";
  return "bg-muted/60 text-muted-foreground";
}

export function ReportQuestionAnalytics({
  data,
  totalQuestions,
  totalAnswers,
  surveyId,
  isLoading,
  onOpenFullPage,
  onQuestionOpen,
}: {
  data: AnalyticsQuestionDetail[];
  totalQuestions?: number;
  totalAnswers?: number;
  surveyId?: string;
  isLoading?: boolean;
  onOpenFullPage?: () => void;
  onQuestionOpen?: (questionId: string) => void;
}) {
  const isAllSurveys = !surveyId || surveyId === "all";

  const sorted = useMemo(() => {
    const list = [...data].sort(
      (a, b) =>
        (b.usersAnswered ?? b.answered) - (a.usersAnswered ?? a.answered)
    );
    return list.slice(0, DASHBOARD_ROW_LIMIT);
  }, [data]);

  const columns = useMemo<DataTableColumn<AnalyticsQuestionDetail>[]>(() => {
    const cols: DataTableColumn<AnalyticsQuestionDetail>[] = [
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
        id: "question",
        header: "Question",
        hideable: false,
        showAccent: true,
        cell: (row) => (
          <p
            className={cn(TABLE_PRIMARY_TEXT_CLASS, "line-clamp-2 leading-snug")}
            title={row.question}
          >
            {row.question}
          </p>
        ),
      },
    ];

    if (isAllSurveys) {
      cols.push({
        id: "survey",
        header: "Survey",
        cell: (row) => (
          <p
            className={cn(TABLE_SUBTEXT_CLASS, "line-clamp-2")}
            title={row.surveyName}
          >
            {row.surveyName || "—"}
          </p>
        ),
      });
    }

    cols.push(
      {
        id: "type",
        header: "Type",
        cell: (row) =>
          row.type ? (
            <span className="inline-flex rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {row.type}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        id: "answered",
        header: "Answered",
        align: "right",
        cell: (row) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {row.usersAnswered ?? row.answered}
          </span>
        ),
      },
      {
        id: "skipped",
        header: "Skipped",
        align: "right",
        cell: (row) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.usersSkipped ?? row.unanswered}
          </span>
        ),
      },
      {
        id: "answerRate",
        header: "Answer rate",
        hideable: false,
        cell: (row) => {
          const rate = Math.round(row.answerRate);
          return (
            <div className="flex min-w-[120px] items-center gap-2.5">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full transition-all", rateBar(rate))}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span
                className={cn(
                  "inline-flex min-w-[42px] justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  rateBadge(rate)
                )}
              >
                {rate}%
              </span>
            </div>
          );
        },
      }
    );

    return cols;
  }, [isAllSurveys]);

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Question analytics"
        description="Per-question answer rates"
        icon={HelpCircle}
      >
        <ChartSkeleton height={200} />
      </AnalyticsCard>
    );
  }

  if (!data.length) {
    return (
      <AnalyticsCard
        title="Question analytics"
        description="Per-question answer rates"
        icon={HelpCircle}
      >
        <p className="py-8 text-center text-sm text-muted-foreground">
          No question data for this period
        </p>
      </AnalyticsCard>
    );
  }

  const answersTotal =
    totalAnswers ??
    data.reduce((sum, q) => sum + (q.usersAnswered ?? q.answered), 0);
  const questionCount = totalQuestions ?? data.length;
  const avgRate = questionCount
    ? Math.round(
        data.reduce((sum, q) => sum + q.answerRate, 0) / data.length
      )
    : 0;

  return (
    <AnalyticsCard
      title="Question analytics"
      description={
        questionCount > DASHBOARD_ROW_LIMIT
          ? `Top ${sorted.length} of ${questionCount} questions`
          : `${questionCount} questions`
      }
      icon={HelpCircle}
      contentClassName="pt-2"
      noPadding
      action={
        <AnalyticsCardActions
          badges={[
            { value: avgRate, label: "Avg rate %" },
            { value: answersTotal, label: "Answers" },
          ]}
          onViewAll={onOpenFullPage}
        />
      }
    >
      <DataTable
        columns={columns}
        data={sorted}
        getRowId={(row) => `${row.surveyId}-${row.questionId}`}
        onRowClick={(row) => onQuestionOpen?.(row.questionId)}
        embedded
        minWidthClassName="min-w-[720px]"
        skeletonRows={DASHBOARD_ROW_LIMIT}
      />

      {questionCount > sorted.length ? (
        <p className="mt-3 px-4 text-center text-[11px] text-muted-foreground">
          Showing top {sorted.length} of {questionCount} questions ·{" "}
          {onOpenFullPage ? (
            <button
              type="button"
              onClick={onOpenFullPage}
              className="font-medium text-[#2c3b59] hover:underline"
            >
              View all questions
            </button>
          ) : null}
        </p>
      ) : null}
    </AnalyticsCard>
  );
}
