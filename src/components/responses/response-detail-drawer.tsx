"use client";

import { AlertTriangle, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { formatCallDuration } from "@/lib/constants/calls";
import { ResponseStatusBadge } from "./response-status-badge";
import { SentimentBadge } from "./sentiment-badge";
import { AiJsonViewer } from "./ai-json-viewer";
import type { SurveyResponse } from "@/types/response";

export function ResponseDetailDrawer({
  response,
  open,
  onOpenChange,
}: {
  response: SurveyResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!response) return null;

  const { aiExtracted, customer } = response;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(customer.firstName, customer.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {customer.company} · {customer.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ResponseStatusBadge status={response.status} />
              <SentimentBadge
                sentiment={aiExtracted.sentiment}
                score={aiExtracted.sentimentScore}
              />
            </div>
          </div>
        </div>
      </SheetHeader>

      <SheetContent className="space-y-6">
        <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Campaign
            </p>
            <p className="mt-0.5 text-sm font-medium">{response.campaignName}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Survey
            </p>
            <p className="mt-0.5 text-sm font-medium">{response.surveyName}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Submitted
            </p>
            <p className="mt-0.5 text-sm">
              {formatRelativeTime(response.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Duration
            </p>
            <p className="mt-0.5 text-sm">
              {formatCallDuration(response.durationSeconds)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Summary
          </h3>
          <p className="rounded-xl border border-border/60 bg-card p-4 text-sm leading-relaxed">
            {aiExtracted.summary}
          </p>
        </div>

        {aiExtracted.keyTopics.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="size-3" />
              Key Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {aiExtracted.keyTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {aiExtracted.flags.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                AI Flags
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {aiExtracted.flags.map((f) => (
                  <span
                    key={f}
                    className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 capitalize dark:text-red-400"
                  >
                    {f.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <AiJsonViewer data={aiExtracted} />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Raw Answers
          </h3>
          <div className="space-y-2">
            {response.answers.map((a) => (
              <div
                key={a.questionId}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {a.questionTitle}
                </p>
                <p className="mt-1 text-sm">
                  {Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
