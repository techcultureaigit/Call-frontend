"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function AnswerChip({ answer }: { answer: string }) {
  const tone = answerTone(answer);
  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-xs font-semibold",
        tone === "yes" && "bg-emerald-500/12 text-emerald-700",
        tone === "no" && "bg-rose-500/12 text-rose-700",
        tone === "neutral" && "bg-primary/10 text-primary"
      )}
    >
      {answer || "—"}
    </span>
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
  const [selected, setSelected] = useState<SurveyResultRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const questions = survey?.questions ?? [];

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: survey?.name ? `${survey.name} · Results` : "Survey Results",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      {
        label: survey?.name ?? "Survey",
        href: `/survey/${surveyId}`,
      },
      { label: "Results" },
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

  const selectedAnswers = useMemo(() => {
    if (!selected) return [];
    return enrichRowAnswers(selected, questions);
  }, [selected, questions]);

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
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_16%,transparent),transparent_55%)]"
      />

      <PageContainer size="full" className="relative">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-1 size-9 shrink-0 rounded-[6px] bg-card/80"
                onClick={() => router.push(`/survey/${surveyId}`)}
                aria-label="Back to survey"
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
                <p className="mt-1 text-sm text-muted-foreground">
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
                  className="h-10 rounded-[6px] border-border/50 bg-card/90 pl-9 shadow-sm"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 rounded-[6px] gap-1.5"
                    disabled={exporting || meta.total === 0}
                  >
                    {exporting ? (
                      <Loader2 className="size-4 animate-spin" />
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

          {!error && (meta.total > 0 || questions.length > 0) ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[6px] border border-border/40 bg-card/90 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Responses
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {meta.total}
                </p>
              </div>
              <div className="rounded-[6px] border border-border/40 bg-card/90 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Questions
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {questions.length || "—"}
                </p>
              </div>
              <div className="rounded-[6px] border border-border/40 bg-card/90 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  On this page
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {enrichedRows.length}
                </p>
              </div>
            </div>
          ) : null}

          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-[6px]" />
              <Skeleton className="h-40 w-full rounded-[6px]" />
            </div>
          ) : error ? (
            <div className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : enrichedRows.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-border/60 bg-card px-6 py-12 text-center">
              <Users className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No responses found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {debouncedSearch
                  ? "Try a different phone or session id."
                  : "Results will appear after calls complete."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[6px] border border-border/50 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="border-b border-border/50 bg-muted/25 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Preview</th>
                      <th className="px-4 py-3">Extracted</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedRows.map((row) => {
                      const preview = row.answers.slice(0, 3);
                      return (
                        <tr
                          key={row.id}
                          className="group cursor-pointer border-b border-border/40 last:border-0 transition-colors hover:bg-brand/5"
                          onClick={() => setSelected(row)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 font-display text-xs font-bold text-primary">
                                {phoneInitials(row.customer_number)}
                              </span>
                              <div className="min-w-0">
                                <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
                                  <Phone className="size-3.5 text-primary" />
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
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {preview.length ? (
                                preview.map((a) => (
                                  <AnswerChip
                                    key={a.questionId}
                                    answer={a.answer}
                                  />
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                              {row.answers.length > 3 ? (
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  +{row.answers.length - 3}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarClock className="size-3.5" />
                              {row.extracted_at
                                ? formatAgentCreatedAt(row.extracted_at)
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 rounded-[6px] gap-1.5 opacity-90 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(row);
                              }}
                            >
                              <Eye className="size-3.5" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating…
                </div>
              ) : null}
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

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
          <div className="relative overflow-hidden border-b border-border/40 bg-linear-to-br from-primary/12 via-background to-brand-soft/40 px-6 pb-5 pt-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-primary/10 blur-2xl"
            />
            <DialogHeader className="relative text-left">
              <DialogTitle className="font-display text-xl">
                Response details
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                    <Phone className="size-3.5 text-primary" />
                    {selected?.customer_number || "—"}
                  </span>
                  {selected?.extracted_at ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                      <CalendarClock className="size-3.5" />
                      {formatAgentCreatedAt(selected.extracted_at)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    <MessageCircle className="size-3.5" />
                    {selectedAnswers.length} answers
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          {selected ? (
            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-2 rounded-[6px] border border-border/40 bg-muted/15 p-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {selected.customer_name || "Unknown contact"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Session
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-foreground">
                    {selected.session_id || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Question &amp; answers
                </p>

                {selectedAnswers.length ? (
                  <ol className="relative space-y-0">
                    <AnimatePresence>
                      {selectedAnswers.map((answer, index) => {
                        const isLast = index === selectedAnswers.length - 1;
                        return (
                          <motion.li
                            key={answer.questionId}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className="relative flex gap-3 pb-5 last:pb-0"
                          >
                            {!isLast ? (
                              <span
                                aria-hidden
                                className="absolute left-4 top-8 bottom-0 w-px bg-border"
                              />
                            ) : null}
                            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 font-display text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1 rounded-[6px] border border-border/50 bg-card p-3 shadow-sm">
                              <p className="text-sm leading-snug text-muted-foreground">
                                {answer.question}
                              </p>
                              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Answer
                                </span>
                                <AnswerChip answer={answer.answer} />
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No answers recorded.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
