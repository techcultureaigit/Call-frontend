"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Phone,
  Search,
  SkipForward,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks";
import { cn } from "@/lib/utils";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { useQuestionAnalytics } from "@/modules/reports/use-reports";
import {
  analyticsHomeHref,
  analyticsQuestionsHref,
} from "@/modules/reports/analytics-nav";
import type { AnalyticsQuestionDetail } from "@/types/reports";

const ANSWER_COLORS = [
  "#2c3b59",
  "#3b4d6b",
  "#4a5f7f",
  "#6b778c",
  "#94a3b8",
  "#cbd5e1",
];

const QUESTION_LIST_VISIBLE = 5;
const USER_TABLE_VISIBLE = 8;

/** Show `visible` rows, then scroll the rest. Page scroll at 150% stays independent. */
function useClipAfterRows(
  visible: number,
  itemCount: number,
  resetKey?: string
) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      setMaxHeight(undefined);
      return;
    }

    const measure = () => {
      const rows = Array.from(
        root.querySelectorAll<HTMLElement>("[data-clip-row]")
      );
      if (!rows.length) {
        setMaxHeight(undefined);
        return;
      }
      const n = Math.min(visible, rows.length);
      const last = rows[n - 1];
      const header = root.querySelector<HTMLElement>("[data-clip-header]");
      const topEl = header ?? rows[0];
      const h =
        last.getBoundingClientRect().bottom - topEl.getBoundingClientRect().top;
      setMaxHeight(Math.ceil(h));
    };

    measure();
    const ro = new ResizeObserver(measure);
    const content =
      root.querySelector("[data-clip-content]") ?? root.firstElementChild;
    if (content) ro.observe(content);
    else ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible, itemCount, resetKey]);

  const clipped = itemCount > visible;
  return {
    ref,
    style: clipped && maxHeight ? { maxHeight } : undefined,
    className: clipped
      ? "overflow-y-auto overscroll-contain scrollbar-thin"
      : undefined,
  };
}

function rateTone(pct: number) {
  if (pct >= 70) return "text-[#2c3b59]";
  if (pct >= 40) return "text-foreground";
  return "text-muted-foreground";
}

function rateBar(pct: number) {
  if (pct >= 70) return "bg-[#2c3b59]";
  if (pct >= 40) return "bg-[#6b778c]";
  return "bg-muted-foreground/35";
}

function rateRing(pct: number) {
  if (pct >= 70) return "stroke-[#2c3b59]";
  if (pct >= 40) return "stroke-[#6b778c]";
  return "stroke-muted-foreground/40";
}

function rateIconBg(pct: number) {
  if (pct >= 70) return "bg-[#2c3b59]/8";
  if (pct >= 40) return "bg-muted/40";
  return "bg-muted/30";
}

function rateSoft(pct: number) {
  return `${rateIconBg(pct)} border-border/50`;
}

function questionKey(q: AnalyticsQuestionDetail) {
  return `${q.surveyId}::${q.questionId}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AnswerRateRing({ rate }: { rate: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (rate / 100) * c;

  return (
    <div className="relative size-[72px] shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", rateRing(rate))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-xl font-bold tabular-nums", rateTone(rate))}>
          {rate}%
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          rate
        </span>
      </div>
    </div>
  );
}

function SummaryStrip({
  totalQuestions,
  totalAnswers,
  avgRate,
  isLoading,
}: {
  totalQuestions?: number;
  totalAnswers?: number;
  avgRate: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[58px] rounded-[6px]" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Questions",
      value: String(totalQuestions ?? 0),
      icon: HelpCircle,
      accent: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Total answers",
      value: (totalAnswers ?? 0).toLocaleString(),
      icon: MessageSquare,
      accent: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Avg answer rate",
      value: `${avgRate}%`,
      icon: BarChart3,
      accent: rateTone(avgRate),
      bg: rateIconBg(avgRate),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-[6px] border border-border/60 bg-card px-3 py-2 shadow-card"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-[6px]",
                item.bg,
                item.accent
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p
                className={cn(
                  "font-display mt-0.5 text-lg font-semibold tabular-nums leading-none",
                  item.accent.includes("text-") ? item.accent : "text-foreground"
                )}
              >
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuestionListItem({
  question,
  index,
  selected,
  onSelect,
}: {
  question: AnalyticsQuestionDetail;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const answered = question.usersAnswered ?? question.answered;
  const skipped = question.usersSkipped ?? question.unanswered;
  const rate = Math.round(question.answerRate);

  return (
    <button
      type="button"
      data-clip-row=""
      onClick={onSelect}
      className={cn(
        "relative flex w-full gap-3 border-b border-border/40 px-3.5 py-2.5 text-left transition-all last:border-b-0",
        selected
          ? "bg-[#2c3b59]/6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#2c3b59]"
          : "hover:bg-muted/25"
      )}
    >
      <span
        className={cn(
          "font-display mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold",
          selected
            ? "bg-[#2c3b59] text-white shadow-sm"
            : "bg-muted/80 text-muted-foreground"
        )}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-hindi text-sm font-medium leading-[1.55] text-foreground">
          {question.question}
        </p>
        {question.description?.trim() ? (
          <p
            className="mt-1 line-clamp-2 text-[11px] text-muted-foreground"
            title={question.description}
          >
            {question.description}
          </p>
        ) : null}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn("h-full rounded-full transition-all", rateBar(rate))}
              style={{ width: `${rate}%` }}
            />
          </div>
          <span
            className={cn(
              "inline-flex min-w-[38px] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              rateSoft(rate),
              rateTone(rate)
            )}
          >
            {rate}%
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3 text-muted-foreground" />
            {answered} answered
          </span>
          <span className="inline-flex items-center gap-1">
            <SkipForward className="size-3 text-muted-foreground" />
            {skipped} skipped
          </span>
        </div>
      </div>
    </button>
  );
}

function AnsweredSkippedBar({
  answered,
  skipped,
  total,
}: {
  answered: number;
  skipped: number;
  total: number;
}) {
  const answeredPct = total ? Math.round((answered / total) * 100) : 0;
  const skippedPct = total ? Math.round((skipped / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted/40">
        {answeredPct > 0 ? (
          <div
            className="bg-[#2c3b59] transition-all"
            style={{ width: `${answeredPct}%` }}
            title={`Answered: ${answered}`}
          />
        ) : null}
        {skippedPct > 0 ? (
          <div
            className="bg-muted-foreground/30 transition-all"
            style={{ width: `${skippedPct}%` }}
            title={`Skipped: ${skipped}`}
          />
        ) : null}
      </div>
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#2c3b59]" />
          Answered {answered} ({answeredPct}%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          Skipped {skipped} ({skippedPct}%)
        </span>
      </div>
    </div>
  );
}

function QuestionDetailPanel({
  question,
  index,
}: {
  question: AnalyticsQuestionDetail;
  index: number;
}) {
  const [userSearch, setUserSearch] = useState("");

  const answered = question.usersAnswered ?? question.answered;
  const total = (question.totalUsers ?? question.total) || 0;
  const skipped = question.usersSkipped ?? question.unanswered;
  const rate = Math.round(question.answerRate);
  const answers = (
    question.topAnswers?.length ? question.topAnswers : question.answers ?? []
  )
    .filter((a) => a.count > 0)
    .slice(0, 8);
  const maxAns = Math.max(...answers.map((a) => a.count), 1);
  const users = question.users ?? [];

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const phone = user.phone?.toLowerCase() ?? "";
      const answer = user.answer?.toLowerCase() ?? "";
      const when = formatDate(user.answeredAt).toLowerCase();
      return phone.includes(q) || answer.includes(q) || when.includes(q);
    });
  }, [users, userSearch]);

  const userClip = useClipAfterRows(
    USER_TABLE_VISIBLE,
    filteredUsers.length,
    question.questionId
  );

  useEffect(() => {
    setUserSearch("");
  }, [question.surveyId, question.questionId]);

  return (
    <motion.div
      key={questionKey(question)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex w-full min-w-0 flex-col rounded-[6px] border border-border/60 bg-card shadow-card"
    >
      <div className="border-b border-border/45 bg-muted/15 px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display inline-flex size-8 items-center justify-center rounded-[6px] bg-[#2c3b59] text-sm font-bold text-white shadow-sm">
                Q{index + 1}
              </span>
              {question.type ? (
                <span className="rounded-full border border-border/55 bg-card px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {question.type.replace(/_/g, " ")}
                </span>
              ) : null}
            </div>
            <h2 className="font-hindi mt-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
              {question.question}
            </h2>
            {question.description?.trim() ? (
              <p
                className="mt-1.5 text-[12px] leading-snug text-muted-foreground"
                title={question.description}
              >
                {question.description}
              </p>
            ) : null}
          </div>
          <AnswerRateRing rate={rate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border/45 sm:grid-cols-4">
        {[
          {
            label: "Answered",
            value: total ? `${answered}/${total}` : String(answered),
            icon: CheckCircle2,
            color: "text-muted-foreground",
          },
          {
            label: "Skipped",
            value: String(skipped),
            icon: SkipForward,
            color: "text-muted-foreground",
          },
          {
            label: "Total users",
            value: String(total),
            icon: Users,
            color: "text-foreground",
          },
          {
            label: "Type",
            value: (question.type || "—").replace(/_/g, " "),
            icon: HelpCircle,
            color: "text-muted-foreground capitalize",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 bg-card px-3 py-2.5"
            >
              <Icon className={cn("size-4 shrink-0 opacity-70", stat.color)} />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 truncate text-sm font-semibold tabular-nums",
                    stat.color
                  )}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-b border-border/45 px-4 py-2.5 sm:px-5">
        <AnsweredSkippedBar answered={answered} skipped={skipped} total={total} />
      </div>

      {/* Natural height — no nested vertical scroll; page scrolls outside */}
      <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <section className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Top answers</p>
            </div>
            {answers.length ? (
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {answers.length} options
              </span>
            ) : null}
          </div>

          {answers.length ? (
            <div className="space-y-2">
              {answers.map((ans, i) => (
                <div
                  key={`${ans.name}-${i}`}
                  className="rounded-[8px] border border-border/40 bg-muted/10 px-3 py-2.5"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-start gap-2 text-sm text-foreground">
                      <span
                        className="mt-1.5 size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            ANSWER_COLORS[i % ANSWER_COLORS.length],
                        }}
                      />
                      <span className="font-medium leading-snug" title={ans.name}>
                        {ans.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm">
                      {ans.count}
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({ans.percent}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(ans.count / maxAns) * 100}%`,
                        backgroundColor:
                          ANSWER_COLORS[i % ANSWER_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-border/55 py-10 text-center">
              <MessageSquare className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No answer breakdown yet
              </p>
            </div>
          )}
        </section>

        <section className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <p className="truncate text-sm font-semibold text-foreground">
                Users who answered
              </p>
            </div>
            {users.length ? (
              <span className="shrink-0 rounded-[6px] border border-border/50 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                {userSearch.trim()
                  ? `${filteredUsers.length} of ${users.length}`
                  : `${users.length} shown`}
              </span>
            ) : null}
          </div>

          {users.length ? (
            <>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search phone, answer, date..."
                  className="h-9 w-full rounded-[6px] border border-border/55 bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/25"
                />
              </div>

              {filteredUsers.length ? (
                <div
                  ref={userClip.ref}
                  style={userClip.style}
                  className={cn(
                    "overflow-x-auto overscroll-contain rounded-[8px] border border-border/55",
                    userClip.className
                  )}
                >
                  <table
                    data-clip-content=""
                    className="w-full min-w-[360px] border-collapse text-left text-xs"
                  >
                    <thead
                      data-clip-header=""
                      className="sticky top-0 z-10 bg-muted/80"
                    >
                      <tr className="border-b border-border/55 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2.5">Phone</th>
                        <th className="px-3 py-2.5">Answer</th>
                        <th className="px-3 py-2.5 text-right">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <tr
                          key={`${user.phone}-${i}`}
                          data-clip-row=""
                          className="border-b border-border/35 transition-colors last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="whitespace-nowrap px-3 py-2.5 font-medium tabular-nums text-foreground">
                            {user.phone}
                          </td>
                          <td className="max-w-[180px] px-3 py-2.5">
                            <span
                              className="inline-block max-w-full truncate rounded-[4px] bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                              title={user.answer}
                            >
                              {user.answer || "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-[11px] text-muted-foreground">
                            {formatDate(user.answeredAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-border/55 py-10 text-center">
                  <Search className="size-7 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No users match your search
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-border/55 py-10 text-center">
              <Phone className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No user samples for this question
              </p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

export function AnalyticsQuestionsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";
  const surveyId = searchParams.get("surveyId") || "all";
  const questionIdParam = searchParams.get("questionId");
  const [search, setSearch] = useState("");

  const backHref = analyticsHomeHref({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    surveyId,
  });

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Question analytics",
    breadcrumbs: [
      { label: "My Surveys", href: "/survey" },
      { label: "Analytics", href: backHref },
      { label: "Questions" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const { data, isLoading } = useQuestionAnalytics({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    surveyId: surveyId === "all" ? undefined : surveyId,
  });

  const questions = useMemo(() => {
    const list = [...(data?.questions ?? [])];
    return list.sort(
      (a, b) =>
        (b.usersAnswered ?? b.answered) - (a.usersAnswered ?? a.answered)
    );
  }, [data?.questions]);

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q)
    );
  }, [questions, search]);

  const avgRate = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(
      questions.reduce((sum, q) => sum + q.answerRate, 0) / questions.length
    );
  }, [questions]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const questionClip = useClipAfterRows(
    QUESTION_LIST_VISIBLE,
    filteredQuestions.length
  );

  useEffect(() => {
    if (!filteredQuestions.length) {
      setSelectedKey(null);
      return;
    }
    if (questionIdParam) {
      const match = filteredQuestions.find((q) => q.questionId === questionIdParam);
      if (match) {
        setSelectedKey(questionKey(match));
        return;
      }
    }
    setSelectedKey((prev) => {
      if (prev && filteredQuestions.some((q) => questionKey(q) === prev)) return prev;
      return questionKey(filteredQuestions[0]);
    });
  }, [filteredQuestions, questionIdParam]);

  const selected =
    filteredQuestions.find((q) => questionKey(q) === selectedKey) ?? null;
  const selectedIndex = selected
    ? filteredQuestions.findIndex((q) => questionKey(q) === selectedKey)
    : -1;

  const selectQuestion = (q: AnalyticsQuestionDetail) => {
    const key = questionKey(q);
    setSelectedKey(key);
    router.replace(
      analyticsQuestionsHref({
        from: dateFrom || undefined,
        to: dateTo || undefined,
        surveyId,
        questionId: q.questionId,
      }),
      { scroll: false }
    );
  };

  return (
    <PageContainer size="full" className="py-3 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex min-w-0 flex-col gap-3 pb-6"
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to analytics
            </Link>
            <h1 className={cn(PAGE_TITLE_CLASS, "mt-1")}>
              Question analytics
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <span className="rounded-[5px] border border-border/55 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
              {dateFrom && dateTo ? `${dateFrom} — ${dateTo}` : "All time"}
            </span>
            {data?.surveyName ? (
              <span className="max-w-[220px] truncate rounded-[6px] border border-border/55 bg-muted/30 px-2 py-1 text-xs font-medium text-foreground">
                {data.surveyName}
              </span>
            ) : (
              <span className="rounded-[5px] border border-border/55 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                All surveys
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <SummaryStrip
            totalQuestions={data?.totalQuestions}
            totalAnswers={data?.totalAnswers}
            avgRate={avgRate}
            isLoading={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-3 lg:grid-cols-12">
            <Skeleton className="h-[360px] rounded-[6px] lg:col-span-4" />
            <Skeleton className="h-[360px] rounded-[6px] lg:col-span-8" />
          </div>
        ) : !questions.length ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[6px] border border-border/60 bg-card text-center shadow-card">
            <HelpCircle className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No question data for this period
            </p>
            <Link
              href={backHref}
              className="mt-4 text-xs font-medium text-brand hover:underline"
            >
              Back to analytics
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
            <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card lg:col-span-4 lg:sticky lg:top-3 lg:self-start">
              <div className="border-b border-border/45 bg-muted/15 px-4 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  All questions
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {filteredQuestions.length}
                  {search ? ` of ${questions.length}` : ""} questions
                </p>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search question or survey..."
                    className="h-8 w-full rounded-[6px] border border-border/55 bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/25"
                  />
                </div>
              </div>
              <div
                ref={questionClip.ref}
                style={questionClip.style}
                className={questionClip.className}
              >
                {filteredQuestions.length ? (
                  <div data-clip-content="">
                    {filteredQuestions.map((q, index) => (
                      <QuestionListItem
                        key={questionKey(q)}
                        question={q}
                        index={index}
                        selected={questionKey(q) === selectedKey}
                        onSelect={() => selectQuestion(q)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No questions match your search
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0 lg:col-span-8">
              {selected ? (
                <QuestionDetailPanel
                  question={selected}
                  index={selectedIndex}
                />
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[6px] border border-dashed border-border/55 bg-card text-center">
                  <HelpCircle className="size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Select a question from the list
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
