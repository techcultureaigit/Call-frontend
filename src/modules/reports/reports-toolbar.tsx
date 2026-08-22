"use client";

import { Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function daysBetween(from: string, to: string): number | null {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff >= 0 ? diff : null;
}

function matchesPreset(from: string, to: string, days: number): boolean {
  const span = daysBetween(from, to);
  if (span == null) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const end = new Date(`${to}T12:00:00`);
  if (Math.abs(end.getTime() - today.getTime()) > 86_400_000) return false;
  return Math.abs(span - days) <= 1;
}

interface ReportsToolbarProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onPreset: (days: number) => void;
  surveyId: string;
  surveyName?: string;
  onSurveyChange: (v: string) => void;
  surveys: { id: string; name: string }[];
  onExportPdf: () => void;
  onExportExcel: () => void;
  isExporting?: boolean;
}

export function ReportsToolbar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onPreset,
  surveyId,
  surveyName,
  onSurveyChange,
  surveys,
  onExportPdf,
  onExportExcel,
  isExporting,
}: ReportsToolbarProps) {
  const activePreset = useMemo(() => {
    for (const p of DATE_PRESETS) {
      if (matchesPreset(dateFrom, dateTo, p.days)) return p.days;
    }
    return null;
  }, [dateFrom, dateTo]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Analytics
            </h1>
            <span
              className="mt-1.5 block h-1 w-14 rounded-full bg-gradient-to-r from-brand via-accent-warm to-brand/40"
              aria-hidden
            />
          </div>
          {surveyId !== "all" && surveyName ? (
            <span className="mt-1 rounded-[4px] bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
              {surveyName}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Call performance, survey insights, and response analytics
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-[6px] border border-border/60 bg-card px-2 py-1 shadow-subtle">
          <Calendar className="mr-1.5 size-3.5 text-brand" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-8 w-[110px] border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
          <span className="mx-0.5 text-[10px] text-muted-foreground">–</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-8 w-[110px] border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex rounded-[6px] border border-border/60 bg-card p-0.5 shadow-subtle">
          {DATE_PRESETS.map((p) => (
            <Button
              key={p.days}
              variant="ghost"
              size="sm"
              onClick={() => onPreset(p.days)}
              className={cn(
                "h-8 px-3 text-sm font-medium",
                activePreset === p.days &&
                  "bg-gradient-to-r from-brand to-accent-warm text-brand-foreground shadow-brand hover:opacity-95"
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <Select
          value={surveyId}
          onChange={(e) => onSurveyChange(e.target.value)}
          options={[
            { label: "All Surveys", value: "all" },
            ...surveys.map((s) => ({ label: s.name, value: s.id })),
          ]}
          className="h-8 w-[min(160px,34vw)] text-sm"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={isExporting}
          className="h-8 gap-1.5 px-2.5 text-sm"
        >
          <FileText className="size-3.5" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          disabled={isExporting}
          className="h-8 gap-1.5 px-2.5 text-sm"
        >
          <FileSpreadsheet className="size-3.5" />
          Excel
        </Button>
      </div>
    </div>
  );
}
