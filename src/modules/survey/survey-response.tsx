"use client";

/**
 * survey-response.tsx
 * Survey call results — list and detail.
 * Route: /survey/[id]/results, /survey/[id]/results/[resultId]
 *
 * API calls in this file:
 *   listSurveyResults()    → GET /api/surveys/:id/results
 *   exportSurveyResults()  → GET /api/surveys/:id/results/export
 *   getSurveyResult()      → GET /api/surveys/:id/results/:resultId
 */

import {
  listSurveyResults,
  exportSurveyResults,
  getSurveyResult,
} from "./api";
import type {
  SurveyResultsExportFormat,
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultRow,
  SurveyResultsSurveyMeta,
} from "./survey-types";
import { SurveyFetchLoader } from "./survey-by-id";
import type { SurveyDisplayStatus } from "./survey-lib";
import { SurveyStatusBadge } from "./survey-dialogs";
import { PageContainer } from "@/components/layout";
import { DataPagination } from "@/components/shared/data-pagination";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageMeta, usePermissions, usePaginatedList } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarClock, Download, FileSpreadsheet, FileText, HelpCircle, MessageSquareText, Phone, Sparkles, Users, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface SurveyResultsViewProps {
  surveyId: string;
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

function phoneInitials(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 2) return "#";
  return digits.slice(-2);
}

function answerTone(answer: string): "yes" | "no" | "neutral" {
  const v = answer.trim().toLowerCase();
  if (["yes", "haan", "ha", "हाँ", "हां"].includes(v)) return "yes";
  if (["no", "nahi", "नहीं", "नही"].includes(v)) return "no";
  return "neutral";
}

function AnswerChip({ answer, index }: { answer: string; index: number }) {
  const tone = answerTone(answer);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={cn(
        "inline-flex max-w-[9.5rem] items-center truncate rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm",
        tone === "yes" &&
          "border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-emerald-400/5 text-emerald-800",
        tone === "no" &&
          "border-rose-500/25 bg-gradient-to-r from-rose-500/15 to-rose-400/5 text-rose-800",
        tone === "neutral" &&
          "border-primary/20 bg-gradient-to-r from-primary/12 to-sky-400/5 text-primary"
      )}
      title={answer}
    >
      {answer || "—"}
    </motion.span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  glowClass,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  glowClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[10px] border border-border/40 bg-card/95 px-4 py-3.5 shadow-sm">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100",
          glowClass
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-[8px] border border-primary/15 bg-primary/10">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
    </div>
  );
}

export function SurveyResponseView({ surveyId }: SurveyResultsViewProps) {
  const router = useRouter();
  const { canExportSurvey } = usePermissions();
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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
        // API: listSurveyResults() → GET /api/surveys/:id/results
        const res = await listSurveyResults(surveyId, {
          page,
          limit,
          search: search || undefined,
        });
        setSurvey(res.survey);
        return { data: res.data, meta: res.meta };
      } catch (error) {
        setSurvey(null);
        throw error;
      }
    },
    [surveyId]
  );

  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    data: rows,
    meta,
    isLoading: loading,
    reload,
  } = usePaginatedList<SurveyResultRow>({
    fetchPage,
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Failed to load results"),
  });

  const questions = survey?.questions ?? [];

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: survey?.name ? `${survey.name} · Results` : "Survey Results",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      { label: survey?.name ?? "Results" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, survey?.name]);

  const enrichedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        answers: enrichRowAnswers(row, questions),
      })),
    [rows, questions]
  );

  const handleExport = async (format: SurveyResultsExportFormat) => {
    if (exporting) return;
    setExporting(true);
    try {
      // API: exportSurveyResults() → GET /api/surveys/:id/results/export
      const { blob, filename } = await exportSurveyResults(
        surveyId,
        {
          format,
          search: debouncedSearch || undefined,
        }
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(
        format === "csv" ? "CSV downloaded" : "Excel sheet downloaded"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export results"
      );
    } finally {
      setExporting(false);
    }
  };

  const status = (survey?.scheduling_status ?? "completed") as SurveyDisplayStatus;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--brand)_8%,transparent),transparent_45%)]"
      />

      <PageContainer size="full" className="relative">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-1 size-9 shrink-0 rounded-[8px] bg-card/80"
                onClick={() => router.push("/survey")}
                aria-label="Back to surveys"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Survey results
                  </h1>
                  {survey?.scheduling_status ? (
                    <SurveyStatusBadge status={status} />
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  {survey?.name ?? "Survey"}
                  {meta.total > 0
                    ? ` · ${meta.total} response${meta.total === 1 ? "" : "s"}`
                    : null}
                </p>
              </div>
            </div>

            <ListToolbar
              className="w-full border-border/40 bg-card/90 p-2 sm:max-w-md lg:ml-auto lg:w-auto lg:max-w-none sm:p-2.5"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search phone or session…"
              searchAriaLabel="Search responses"
              actions={
                canExportSurvey ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 shrink-0 rounded-[6px] gap-1.5 border-primary/20 bg-card hover:border-primary/40"
                        disabled={exporting || meta.total === 0}
                      >
                        {exporting ? (
                          <AppLoaderSpinner size="sm" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        disabled={exporting}
                        onClick={() => void handleExport("xlsx")}
                        className="gap-2"
                      >
                        <FileSpreadsheet className="size-4 text-primary" />
                        Excel (.xlsx)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={exporting}
                        onClick={() => void handleExport("csv")}
                        className="gap-2"
                      >
                        <FileText className="size-4 text-primary" />
                        CSV (.csv)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null
              }
            />
          </div>

          {!error && meta.total > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Responses"
                value={meta.total}
                icon={Users}
                glowClass="bg-primary/25"
              />
              <StatCard
                label="Questions"
                value={questions.length || "—"}
                icon={HelpCircle}
                glowClass="bg-sky-400/25"
              />
              <StatCard
                label="On this page"
                value={enrichedRows.length}
                icon={MessageSquareText}
                glowClass="bg-emerald-400/25"
              />
            </div>
          ) : null}

          {loading ? (
            <SurveyFetchLoader label="Loading results" />
          ) : error ? (
            <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : enrichedRows.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border/60 bg-card/80 px-6 py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-7 text-primary" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">
                No responses found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Try a different phone or session id."
                  : "Results will appear after calls complete."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-border/50 bg-card/95 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-gradient-to-r from-primary/8 via-transparent to-sky-400/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Response list
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Preview answers, then open full Q&A
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border/40">
                {enrichedRows.map((row, rowIndex) => {
                  const preview = row.answers.slice(0, 3);
                  return (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.04, duration: 0.25 }}
                      className="group grid gap-4 px-4 py-4 transition-colors hover:bg-primary/[0.03] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto] sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/20 to-sky-400/10 font-display text-sm font-bold text-primary ring-1 ring-primary/15">
                          {phoneInitials(row.customer_number)}
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1.5 truncate font-semibold text-foreground">
                            <Phone className="size-3.5 shrink-0 text-primary" />
                            {row.customer_number || "—"}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {row.customer_name || "Unknown contact"}
                            {" · "}
                            {row.answers.length} answer
                            {row.answers.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
                          Preview
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {preview.length ? (
                            preview.map((a, i) => (
                              <AnswerChip
                                key={a.questionId}
                                answer={a.answer}
                                index={i}
                              />
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                          {row.answers.length > 3 ? (
                            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              +{row.answers.length - 3} more
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground sm:justify-self-end">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider sm:hidden">
                          Extracted
                        </p>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
                          <CalendarClock className="size-3.5" />
                          {row.extracted_at
                            ? formatSurveyCreatedAt(row.extracted_at)
                            : "—"}
                        </span>
                      </div>

                      <div className="sm:justify-self-end">
                        <Button
                          type="button"
                          size="sm"
                          className="group/btn h-9 rounded-[8px] gap-1.5 px-3.5 font-semibold shadow-brand"
                          onClick={() =>
                            router.push(
                              `/survey/${surveyId}/results/${row.id}`
                            )
                          }
                        >
                          View details
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {!error && meta.total > 0 ? (
            <DataPagination
              meta={meta}
              onPageChange={setPage}
              itemLabel="responses"
            />
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}

interface SurveyResultDetailViewProps {
  surveyId: string;
  resultId: string;
}

function DetailAnswerChip({ answer }: { answer: string }) {
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

export function SurveyResponseDetailView({
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
      // API: getSurveyResult() → GET /api/surveys/:id/results/:resultId
      const res = await getSurveyResult(surveyId, resultId);
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
            <SurveyFetchLoader label="Loading response" />
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
                      {formatSurveyCreatedAt(result.extracted_at)}
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
                                <DetailAnswerChip answer={answer.answer} />
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
