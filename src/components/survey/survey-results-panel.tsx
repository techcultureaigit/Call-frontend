"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLoader } from "@/components/ui/app-loader";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { SurveyResultRow } from "@/types/survey-result";

interface SurveyResultsPanelProps {
  surveyId: string;
}

export function SurveyResultsPanel({ surveyId }: SurveyResultsPanelProps) {
  const [rows, setRows] = useState<SurveyResultRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await surveysModuleService.listResults(surveyId, {
          page: nextPage,
          limit: 20,
        });
        setRows(res.data);
        setTotal(res.meta.total);
        setPage(res.meta.page);
        setTotalPages(res.meta.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [surveyId]
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <section className="space-y-3 rounded-[6px] border border-border/40 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <Users className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Customer responses
            </h2>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading…" : `${total} response${total === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <AppLoader variant="compact" label="Loading customer details" />
      ) : error ? (
        <div className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          No customer responses yet for this survey.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[6px] border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border/50 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-8 px-3 py-2.5" />
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">Extracted</th>
                  <th className="px-3 py-2.5">Answers</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const open = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-b border-border/40">
                        <td className="px-2 py-2 align-top">
                          <button
                            type="button"
                            className="inline-flex size-7 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-expanded={open}
                            aria-label={open ? "Hide answers" : "Show answers"}
                            onClick={() => setExpandedId(open ? null : row.id)}
                          >
                            {open ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <p className="font-medium text-foreground">
                            {row.customer_name || "—"}
                          </p>
                          {row.customer_company ? (
                            <p className="text-xs text-muted-foreground">
                              {row.customer_company}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5 text-primary" />
                            {row.customer_number || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 align-top text-muted-foreground">
                          {row.extracted_at
                            ? formatAgentCreatedAt(row.extracted_at)
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 align-top text-muted-foreground">
                          {row.answers?.length ?? 0}
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-b border-border/40 bg-muted/15">
                          <td colSpan={5} className="px-4 py-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Responses · session {row.session_id || "—"}
                            </p>
                            {row.answers?.length ? (
                              <ul className="space-y-2">
                                {row.answers.map((answer) => (
                                  <li
                                    key={answer.questionId}
                                    className="rounded-[6px] border border-border/40 bg-background px-3 py-2"
                                  >
                                    <p className="text-xs text-muted-foreground">
                                      {answer.question}
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-foreground">
                                      {answer.answer || "—"}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No answers recorded.
                              </p>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[6px]"
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[6px]"
            disabled={page >= totalPages}
            onClick={() => void load(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
