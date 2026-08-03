"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  MessageCircle,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { usePageMeta } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { surveysModuleService } from "@/services/surveys-module.service";
import type {
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultRow,
  SurveyResultsSurveyMeta,
} from "@/types/survey-result";
import { SurveyFetchLoader } from "./survey-fetch-loader";

interface SurveyResultDetailViewProps {
  surveyId: string;
  resultId: string;
}

function resolveOptionLabel(
  question: SurveyResultQuestionMeta | undefined,
  raw: unknown
): string {
  if (raw == null || raw === "") return "";
  const value = String(raw);
  const options = question?.options ?? [];
  if (!options.length) return value;
  const match = options.find(
    (opt) =>
      String(opt.value) === value ||
      String(opt.label).toLowerCase() === value.toLowerCase()
  );
  return match?.label || value;
}

function enrichRowAnswers(
  row: SurveyResultRow,
  questions: SurveyResultQuestionMeta[]
): SurveyResultAnswer[] {
  if (row.answers?.length) {
    return row.answers.map((a) => ({
      ...a,
      question:
        a.question && a.question !== a.questionId
          ? a.question
          : questions.find((q) => q.id === a.questionId)?.question || a.question,
    }));
  }

  const extracted = row.extracted_data ?? {};
  const ordered = questions.length
    ? [
        ...questions.map((q) => q.id),
        ...Object.keys(extracted).filter(
          (id) => !questions.some((q) => q.id === id)
        ),
      ]
    : Object.keys(extracted);

  return ordered
    .filter((id) => Object.prototype.hasOwnProperty.call(extracted, id))
    .map((questionId) => {
      const meta = questions.find((q) => q.id === questionId);
      const raw = extracted[questionId];
      return {
        questionId,
        question: meta?.question || questionId,
        type: meta?.type || "text",
        answer: resolveOptionLabel(meta, raw),
        rawAnswer: raw,
      };
    });
}

function answerTone(answer: string): "yes" | "no" | "neutral" {
  const v = answer.trim().toLowerCase();
  if (["yes", "haan", "ha", "हाँ", "हां"].includes(v)) return "yes";
  if (["no", "nahi", "नहीं", "नही"].includes(v)) return "no";
  return "neutral";
}

function AnswerChip({ answer }: { answer: string }) {
  const tone = answerTone(answer);
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        tone === "yes" &&
          "bg-emerald-500/12 text-emerald-700 ring-1 ring-inset ring-emerald-500/20",
        tone === "no" &&
          "bg-rose-500/12 text-rose-700 ring-1 ring-inset ring-rose-500/20",
        tone === "neutral" &&
          "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
      )}
    >
      {answer || "—"}
    </span>
  );
}

export function SurveyResultDetailView({
  surveyId,
  resultId,
}: SurveyResultDetailViewProps) {
  const router = useRouter();
  const [result, setResult] = useState<SurveyResultRow | null>(null);
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questions = survey?.questions ?? [];

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: survey?.name
      ? `${survey.name} · Response`
      : "Response details",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      {
        label: survey?.name ?? "Results",
        href: `/survey/${surveyId}/results`,
      },
      { label: "Details" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, survey?.name]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await surveysModuleService.getResult(surveyId, resultId);
      setResult(res.result);
      setSurvey(res.survey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load response");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [surveyId, resultId]);

  useEffect(() => {
    void load();
  }, [load]);

  const answers = useMemo(() => {
    if (!result) return [];
    return enrichRowAnswers(result, questions);
  }, [result, questions]);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_16%,transparent),transparent_55%)]"
      />

      <PageContainer size="full" className="relative">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-1 size-9 shrink-0 rounded-[6px] bg-card/80"
              onClick={() => router.push(`/survey/${surveyId}/results`)}
              aria-label="Back to results"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Response details
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {survey?.name ?? "Survey"}
                {result?.customer_number
                  ? ` · ${result.customer_number}`
                  : null}
              </p>
            </div>
          </div>

          {loading ? (
            <SurveyFetchLoader label="Loading response" hint="Fetching Q&A details" />
          ) : error ? (
            <div className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[6px] border border-border/50 bg-card shadow-sm"
            >
              <header className="border-b border-border/40 bg-linear-to-br from-primary/12 via-background to-brand-soft/40 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                    <Phone className="size-3.5 text-primary" />
                    {result.customer_number || "—"}
                  </span>
                  {result.extracted_at ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                      <CalendarClock className="size-3.5" />
                      {formatAgentCreatedAt(result.extracted_at)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    <MessageCircle className="size-3.5" />
                    {answers.length} answers
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {result.customer_name || "Unknown contact"}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Session
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-foreground">
                      {result.session_id || "—"}
                    </p>
                  </div>
                </div>
              </header>

              <div className="px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Questions &amp; answers
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {answers.length} recorded
                  </span>
                </div>

                {answers.length ? (
                  <ol className="relative space-y-2.5">
                    {answers.map((answer, index) => {
                      const tone = answerTone(answer.answer);
                      return (
                        <li
                          key={answer.questionId}
                          className="group relative overflow-hidden rounded-[6px] border border-border/50 bg-card shadow-sm transition-colors hover:border-primary/25"
                        >
                          <div
                            aria-hidden
                            className={cn(
                              "absolute inset-y-0 left-0 w-1",
                              tone === "yes" && "bg-emerald-500/70",
                              tone === "no" && "bg-rose-500/70",
                              tone === "neutral" && "bg-primary/60"
                            )}
                          />
                          <div className="flex gap-3 px-3.5 py-3 pl-4 sm:gap-3.5 sm:px-4 sm:pl-5">
                            <span
                              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary"
                              aria-hidden
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1 space-y-2">
                              <p className="text-sm leading-snug text-foreground">
                                {answer.question}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                                  Answer
                                </span>
                                <span
                                  aria-hidden
                                  className="h-px flex-1 bg-border/60"
                                />
                                <AnswerChip answer={answer.answer} />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="rounded-[6px] border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                    No answers recorded.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AppLoaderSpinner size="sm" />
              Loading…
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
