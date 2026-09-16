"use client";

import { useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { cn } from "@/lib/utils";
import type { AnalyticsQuestionDetail } from "@/types/reports";

/** Dashboard preview: show all when few, cap at 8 when many (no inner scroll). */
const DASHBOARD_ROW_LIMIT = 8;

function typeBadge(type?: string) {
  const raw = (type || "").toLowerCase().replace(/_/g, "");
  if (raw.includes("yes") || raw.includes("boolean")) {
    return "bg-emerald-500/12 text-emerald-700";
  }
  if (raw.includes("text") || raw.includes("open")) {
    return "bg-muted text-muted-foreground";
  }
  return "bg-[#3b82f6]/10 text-[#2563eb]";
}

function typeLabel(type?: string) {
  const raw = (type || "").trim();
  if (!raw) return "—";
  if (/yes.?no/i.test(raw) || raw.toLowerCase() === "boolean") return "YES / NO";
  return raw.replace(/_/g, " ").toUpperCase();
}

function RateRing({ value }: { value: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0 -rotate-90" aria-hidden>
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-[#2c3b59]/15"
      />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped / 100)}
        className="text-[#2c3b59]"
      />
    </svg>
  );
}

function AnswerRateBar({ rate }: { rate: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#2c3b59]/10">
        <div
          className="h-full rounded-full bg-[#2c3b59]"
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[12px] font-semibold tabular-nums text-foreground">
        {rate}%
      </span>
    </div>
  );
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

  const answersTotal =
    totalAnswers ??
    data.reduce((sum, q) => sum + (q.usersAnswered ?? q.answered), 0);
  const questionCount = totalQuestions ?? data.length;
  const avgRate = data.length
    ? Math.round(data.reduce((sum, q) => sum + q.answerRate, 0) / data.length)
    : 0;
  const showingAll = sorted.length >= questionCount;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[6px] border border-border/70 bg-card shadow-[0_4px_18px_rgba(44,59,89,0.05)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5 sm:px-3.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-foreground">
            Question analytics
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {showingAll
              ? `${sorted.length} of ${questionCount || sorted.length}`
              : `Top ${sorted.length} of ${questionCount || sorted.length}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
            <RateRing value={avgRate} />
            {avgRate}% avg. answer rate
          </span>
          <span className="rounded-full bg-emerald-500/12 px-2 py-px text-[10px] font-medium text-emerald-800">
            {answersTotal} total answers
          </span>
          <span className="rounded-full bg-[#3b82f6]/10 px-2 py-px text-[10px] font-medium text-[#2563eb]">
            {questionCount} questions
          </span>
          {onOpenFullPage ? (
            <button
              type="button"
              onClick={onOpenFullPage}
              className="text-[11px] font-medium text-[#2563eb] hover:underline"
            >
              View all
            </button>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="p-2.5">
          <ChartSkeleton height={96} />
        </div>
      ) : !data.length ? (
        <div className="flex flex-1 items-center gap-2 px-3.5 text-sm text-muted-foreground">
          <HelpCircle className="size-4" />
          No question data for this period
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Desktop / tablet table header */}
          <div
            className={cn(
              "hidden shrink-0 items-center gap-2 border-b border-border/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:grid md:px-3.5",
              isAllSurveys
                ? "md:grid-cols-[28px_minmax(0,1.6fr)_minmax(72px,0.7fr)_72px_64px_56px_minmax(96px,140px)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_64px_56px_140px]"
                : "md:grid-cols-[28px_minmax(0,1.8fr)_72px_64px_56px_minmax(96px,140px)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_56px_140px]"
            )}
          >
            <span>#</span>
            <span>Question</span>
            {isAllSurveys ? <span className="truncate">Survey</span> : null}
            <span>Type</span>
            <span className="text-right">Answered</span>
            <span className="text-right">Skipped</span>
            <span>Answer rate</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {sorted.map((row, index) => {
              const answered = row.usersAnswered ?? row.answered;
              const skipped = row.usersSkipped ?? row.unanswered;
              const rate = Math.round(row.answerRate);
              return (
                <button
                  key={`${row.surveyId}-${row.questionId}`}
                  type="button"
                  onClick={() => onQuestionOpen?.(row.questionId)}
                  className={cn(
                    "w-full border-t border-border/30 text-left transition-colors first:border-t-0",
                    "hover:bg-[#2c3b59]/3",
                    // Mobile: stacked card
                    "flex flex-col gap-2 px-3 py-2.5",
                    // md+: table row with natural height (no flex-1 crush)
                    "md:grid md:items-start md:gap-2 md:px-3.5 md:py-2.5",
                    isAllSurveys
                      ? "md:grid-cols-[28px_minmax(0,1.6fr)_minmax(72px,0.7fr)_72px_64px_56px_minmax(96px,140px)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_64px_56px_140px]"
                      : "md:grid-cols-[28px_minmax(0,1.8fr)_72px_64px_56px_minmax(96px,140px)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_56px_140px]"
                  )}
                >
                  {/* Mobile header row */}
                  <div className="flex items-start gap-2.5 md:contents">
                    <span className="mt-0.5 text-[11px] tabular-nums text-muted-foreground md:mt-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="font-hindi min-w-0 flex-1 whitespace-normal wrap-break-word text-[14px] font-medium leading-[1.55] text-foreground sm:text-[15px] md:flex-none">
                      {row.question}
                    </p>
                  </div>

                  {isAllSurveys ? (
                    <span className="hidden truncate text-[11px] text-muted-foreground md:block">
                      {row.surveyName || "—"}
                    </span>
                  ) : null}

                  {/* Mobile meta + desktop cells */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-7 md:contents md:pl-0">
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-1.5 py-px text-[9px] font-semibold tracking-wide",
                        typeBadge(row.type)
                      )}
                    >
                      {typeLabel(row.type)}
                    </span>

                    {isAllSurveys ? (
                      <span className="truncate text-[11px] text-muted-foreground md:hidden">
                        {row.surveyName || "—"}
                      </span>
                    ) : null}

                    <span className="text-[12px] tabular-nums text-muted-foreground md:hidden">
                      <span className="font-semibold text-foreground">
                        {answered}
                      </span>{" "}
                      ans ·{" "}
                      <span className="font-semibold text-foreground">
                        {skipped}
                      </span>{" "}
                      skip
                    </span>

                    <span className="hidden text-right text-[13px] font-semibold tabular-nums text-foreground md:block">
                      {answered}
                    </span>
                    <span className="hidden text-right text-[13px] font-semibold tabular-nums text-foreground md:block">
                      {skipped}
                    </span>

                    <div className="w-full min-w-0 md:w-auto">
                      <AnswerRateBar rate={rate} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
