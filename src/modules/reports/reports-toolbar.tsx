"use client";

import {
  ArrowLeft,
  BarChart3,
  CalendarCheck2,
  CalendarPlus,
  CalendarRange,
  Download,
  ListFilter,
  MessagesSquare,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyticsSurveyDates } from "@/types/reports";

function formatMetaDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function formatSurveyPeriod(dates?: AnalyticsSurveyDates | null) {
  if (dates?.callWindowStart || dates?.callWindowEnd) {
    return `${dates.callWindowStart || "—"} – ${dates.callWindowEnd || "—"}`;
  }
  return "—";
}

function scheduledLabel(dates?: AnalyticsSurveyDates | null) {
  if (!dates?.startAt && !dates?.endAt && !dates?.scheduledAt) {
    if (
      dates?.schedulingStatus !== "scheduled" &&
      dates?.schedulingStatus !== "completed"
    ) {
      return "Not scheduled";
    }
  }
  const start = dates?.startAt
    ? formatMetaDateTime(dates.startAt)
    : dates?.scheduledAt
      ? formatMetaDateTime(dates.scheduledAt)
      : "—";
  const end = dates?.endAt ? formatMetaDateTime(dates.endAt) : "—";
  return `Start: ${start}\nEnd: ${end}`;
}

function DateTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-[6px] border border-border/50 bg-card px-3 py-2 shadow-subtle">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-[#2c3b59]/10 text-[#2c3b59]">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p
          className="whitespace-pre-line text-[12px] font-semibold tabular-nums text-foreground sm:text-[13px]"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface ReportsToolbarProps {
  surveyId: string;
  surveyName?: string;
  totalCalls?: number;
  surveyDates?: AnalyticsSurveyDates | null;
  lockedSurveyId?: string;
  onExportPdf: () => void;
  isExporting?: boolean;
  reorderMode?: boolean;
  onReorderModeChange?: (enabled: boolean) => void;
  onResetLayout?: () => void;
}

export function ReportsToolbar({
  surveyId: _surveyId,
  surveyName,
  totalCalls,
  surveyDates,
  lockedSurveyId,
  onExportPdf,
  isExporting,
  reorderMode = false,
  onReorderModeChange,
  onResetLayout,
}: ReportsToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2.5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 max-w-2xl items-start gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="mt-0.5 size-9 shrink-0"
          >
            <Link
              href={lockedSurveyId ? `/survey/${lockedSurveyId}` : "/survey"}
              aria-label="Back to survey"
            >
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#2c3b59]/10 text-[#2c3b59]">
            <BarChart3 className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-sans text-[22px] font-semibold tracking-tight text-[#1a2233]">
              Analytics
            </h1>
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {surveyName
                ? `${surveyName}${
                    typeof totalCalls === "number"
                      ? ` · ${totalCalls.toLocaleString()} Calls`
                      : ""
                  }`
                : "Survey performance, missed calls, and completion"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {lockedSurveyId ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-3 text-sm"
            >
              <Link href={`/survey/${lockedSurveyId}/results`}>
                <MessagesSquare className="size-3.5" />
                Responses
              </Link>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onReorderModeChange?.(!reorderMode)}
            className={cn(
              "h-9 gap-1.5 px-3 text-sm",
              reorderMode && "border-brand/40 bg-brand/5 text-brand"
            )}
          >
            <ListFilter className="size-3.5" />
            {reorderMode ? "Done" : "Reorder"}
          </Button>

          {reorderMode && onResetLayout ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetLayout}
              className="h-9 gap-1.5 px-3 text-sm"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          ) : null}

          <Button
            size="sm"
            onClick={onExportPdf}
            disabled={isExporting}
            className="h-9 gap-1.5 bg-[#2c3b59] px-3.5 text-sm text-white hover:bg-[#24314a]"
          >
            <Download className="size-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <DateTile
          icon={CalendarPlus}
          label="Created"
          value={formatMetaDateTime(surveyDates?.createdAt)}
        />
        <DateTile
          icon={CalendarCheck2}
          label="Scheduled"
          value={scheduledLabel(surveyDates)}
        />
        <DateTile
          icon={CalendarRange}
          label="Call window"
          value={formatSurveyPeriod(surveyDates)}
        />
      </div>
    </div>
  );
}
