"use client";

import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurveyDisplayStatus } from "@/lib/utils/survey-readiness";
import { SurveyStatusBadge } from "./survey-status-badge";

interface SurveyTopNavProps {
  surveyName?: string;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  status?: SurveyDisplayStatus;
}

export function SurveyTopNav({
  surveyName = "",
  previewOpen = false,
  onTogglePreview,
  status = "draft",
}: SurveyTopNavProps) {
  const title = surveyName.trim() || "Untitled survey";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Link
          href="/survey"
          className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-[6px] px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-7 items-center justify-center rounded-lg border border-border/70 bg-card transition-colors group-hover:border-brand/40 group-hover:text-brand">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
          <span className="hidden sm:inline">Back to Surveys</span>
        </Link>

        <span
          aria-hidden
          className="hidden h-5 w-px shrink-0 bg-border/70 sm:block"
        />

        {/* Survey name — one line */}
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Survey
          </span>
          <h1
            className="truncate text-base font-semibold tracking-tight text-foreground"
            title={title}
          >
            <span className="border-b-2 border-brand/40 pb-0.5">{title}</span>
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onTogglePreview && (
          <button
            type="button"
            onClick={onTogglePreview}
            aria-pressed={previewOpen}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-[6px] border px-3 text-[13px] font-medium transition-colors",
              previewOpen
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border/70 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >
            {previewOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRightOpen className="size-4" />
            )}
            <span className="hidden sm:inline">
              {previewOpen ? "Hide preview" : "Show preview"}
            </span>
          </button>
        )}

        <SurveyStatusBadge status={status} size="md" withDot />
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </button>
      </div>
    </div>
  );
}
