"use client";

import { useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { cn } from "@/lib/utils";
import type { AnalyticsQuestionDetail } from "@/types/reports";

/** Dashboard preview: show all when few, cap at 8 when many. */
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
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[#2c3b59]/10">
        <div
          className="h-full rounded-full bg-[#2c3b59]"
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground">
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

  const colClass = isAllSurveys
    ? "md:grid-cols-[24px_minmax(0,1fr)_minmax(64px,0.6fr)_64px_56px_48px_minmax(88px,1fr)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_64px_56px_minmax(120px,160px)]"
    : "md:grid-cols-[24px_minmax(0,1fr)_64px_56px_48px_minmax(88px,1fr)] lg:grid-cols-[28px_minmax(0,1fr)_88px_72px_56px_minmax(120px,160px)]";

  return (
    <section className="flex w-full min-w-0 flex-col overflow-hidden rounded-[6px] border border-border/70 bg-card shadow-[0_4px_18px_rgba(44,59,89,0.05)] md:h-full md:min-h-0">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5 sm:px-3.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="font-sans text-[12px] font-semibold tracking-tight text-foreground">
            Question analytics
          </h2>
          <span className="text-[10px] text-muted-foreground">
            {showingAll
              ? `${sorted.length} of ${questionCount || sorted.length}`
              : `Top ${sorted.length} of ${questionCount || sorted.length}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground">
            <RateRing value={avgRate} />
            {avgRate}% avg. answer rate
          </span>
          <span className="rounded-full bg-emerald-500/12 px-2 py-px text-[9px] font-medium text-emerald-800">
            {answersTotal} total answers
          </span>
          <span className="rounded-full bg-[#3b82f6]/10 px-2 py-px text-[9px] font-medium text-[#2563eb]">
            {questionCount} questions
          </span>
          {onOpenFullPage ? (
            <button
              type="button"
              onClick={onOpenFullPage}
              className="text-[10px] font-medium text-[#2563eb] hover:underline"
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
        <div className="flex items-center gap-2 px-3.5 py-4 text-sm text-muted-foreground">
          <HelpCircle className="size-4" />
          No question data for this period
        </div>
      ) : (
        <div className="flex min-w-0 w-full flex-col md:min-h-0 md:flex-1">
          <div
            className={cn(
              "hidden shrink-0 items-center gap-2 border-b border-border/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:grid md:px-3.5",
              colClass
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

          {/* Mobile: page scrolls. Desktop: only the question list scrolls */}
          <div className="min-w-0 w-full md:min-h-0 md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:overscroll-contain">
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
                    "box-border flex w-full min-h-[2.85rem] border-t border-border/30 text-left transition-colors first:border-t-0",
                    "hover:bg-[#2c3b59]/3",
                    "flex-col justify-center gap-1 px-3 py-1.5",
                    "md:grid md:items-center md:gap-2 md:px-3.5 md:py-1.5",
                    colClass
                  )}
                >
                  <div className="flex items-start gap-2 md:contents">
                    <span className="mt-0.5 text-[10px] tabular-nums text-muted-foreground md:mt-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="font-hindi line-clamp-2 min-w-0 flex-1 whitespace-normal wrap-break-word text-[12px] font-medium leading-snug text-foreground md:flex-none"
                      title={row.question}
                    >
                      {row.question}
                    </p>
                  </div>

                  {isAllSurveys ? (
                    <span className="hidden truncate text-[10px] text-muted-foreground md:block">
                      {row.surveyName || "—"}
                    </span>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 md:contents md:pl-0">
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-1.5 py-px text-[8px] font-semibold tracking-wide",
                        typeBadge(row.type)
                      )}
                    >
                      {typeLabel(row.type)}
                    </span>

                    {isAllSurveys ? (
                      <span className="truncate text-[10px] text-muted-foreground md:hidden">
                        {row.surveyName || "—"}
                      </span>
                    ) : null}

                    <span className="text-[11px] tabular-nums text-muted-foreground md:hidden">
                      <span className="font-semibold text-foreground">
                        {answered}
                      </span>{" "}
                      ans ·{" "}
                      <span className="font-semibold text-foreground">
                        {skipped}
                      </span>{" "}
                      skip
                    </span>

                    <span className="hidden text-right text-[12px] font-semibold tabular-nums text-foreground md:block">
                      {answered}
                    </span>
                    <span className="hidden text-right text-[12px] font-semibold tabular-nums text-foreground md:block">
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
