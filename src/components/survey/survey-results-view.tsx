"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  MessageSquareText,
  Phone,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageMeta } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { SurveyResultsExportFormat } from "@/api/surveys";
import type { PaginatedMeta } from "@/types";
import type {
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultRow,
  SurveyResultsSurveyMeta,
} from "@/types/survey-result";
import { SurveysPagination } from "./surveys-pagination";
import { SurveyStatusBadge } from "./survey-status-badge";
import { SurveyFetchLoader } from "./survey-fetch-loader";
import type { SurveyDisplayStatus } from "@/lib/utils/survey-readiness";

interface SurveyResultsViewProps {
  surveyId: string;
}

const EMPTY_META: PaginatedMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

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

export function SurveyResultsView({ surveyId }: SurveyResultsViewProps) {
  const router = useRouter();
  const [rows, setRows] = useState<SurveyResultRow[]>([]);
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await surveysModuleService.listResults(surveyId, {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
      });
      setRows(res.data);
      setSurvey(res.survey);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [surveyId, page, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const { blob, filename } = await surveysModuleService.exportResults(
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

            <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:max-w-none">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search phone or session…"
                  className="h-10 rounded-[8px] border-border/50 bg-card/90 pl-9 shadow-sm"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 rounded-[8px] gap-1.5 border-primary/20 bg-card hover:border-primary/40"
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
            </div>
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
            <SurveyFetchLoader
              label="Loading results"
              hint="Fetching survey responses"
            />
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
                            ? formatAgentCreatedAt(row.extracted_at)
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
            <SurveysPagination
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
