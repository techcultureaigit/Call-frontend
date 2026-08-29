"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseKey(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatShortDate(value: string) {
  const date = parseKey(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthCells(view: Date) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface ReportsToolbarProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  surveyId: string;
  surveyName?: string;
  onSurveyChange: (v: string) => void;
  surveys: { id: string; name: string }[];
  onExportPdf: () => void;
  isExporting?: boolean;
  reorderMode?: boolean;
  onReorderModeChange?: (enabled: boolean) => void;
  onResetLayout?: () => void;
}

export function ReportsToolbar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  surveyId,
  surveyName,
  onSurveyChange,
  surveys,
  onExportPdf,
  isExporting,
  reorderMode = false,
  onReorderModeChange,
  onResetLayout,
}: ReportsToolbarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(dateFrom);
  const [draftTo, setDraftTo] = useState(dateTo);
  const [picking, setPicking] = useState<"from" | "to">("from");
  const [viewMonth, setViewMonth] = useState(() => parseKey(dateTo || dateFrom));

  const surveyOptions = useMemo(
    () => [
      { label: "All Surveys", value: "all" },
      ...surveys.map((s) => ({ label: s.name, value: s.id })),
    ],
    [surveys]
  );

  const cells = useMemo(() => getMonthCells(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const rangeStart = useMemo(() => parseKey(draftFrom), [draftFrom]);
  const rangeEnd = useMemo(() => parseKey(draftTo), [draftTo]);

  useEffect(() => {
    if (!open) return;
    setDraftFrom(dateFrom);
    setDraftTo(dateTo);
    setPicking("from");
    setViewMonth(parseKey(dateTo || dateFrom));
  }, [open, dateFrom, dateTo]);

  const applyRange = (from: string, to: string) => {
    const start = parseKey(from);
    const end = parseKey(to);
    if (start.getTime() > end.getTime()) {
      onDateFromChange(to);
      onDateToChange(from);
    } else {
      onDateFromChange(from);
      onDateToChange(to);
    }
    setOpen(false);
  };

  const handleDayClick = (day: Date) => {
    const key = toKey(day);

    if (picking === "from") {
      setDraftFrom(key);
      if (parseKey(draftTo).getTime() < day.getTime()) {
        setDraftTo(key);
      }
      setPicking("to");
      return;
    }

    if (day.getTime() < rangeStart.getTime()) {
      setDraftFrom(key);
      setDraftTo(draftFrom);
      setPicking("from");
      return;
    }

    setDraftTo(key);
    applyRange(draftFrom, key);
  };

  const inRange = (day: Date) => {
    const t = day.getTime();
    return t >= rangeStart.getTime() && t <= rangeEnd.getTime();
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className={PAGE_TITLE_CLASS}>
          Analytics Report
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Call performance, survey insights, and response analytics
        </p>
        {surveyId !== "all" && surveyName ? (
          <span className="mt-2 inline-flex rounded-[6px] border border-[#2c3b59]/15 bg-[#2c3b59]/6 px-2 py-0.5 text-[10px] font-medium text-[#2c3b59]">
            {surveyName}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-[6px] border border-border/60 bg-card px-2.5",
                "text-sm font-medium text-foreground shadow-subtle outline-none",
                "transition-colors hover:border-brand/30",
                "focus-visible:ring-2 focus-visible:ring-brand/25",
                open && "border-brand/40"
              )}
              aria-label="Select date range"
            >
              <CalendarDays className="size-3.5 shrink-0 text-[#2c3b59]" />
              <span className="whitespace-nowrap tabular-nums">
                {formatShortDate(dateFrom)} – {formatShortDate(dateTo)}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 opacity-50 transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[300px] rounded-[6px] p-3"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                  )
                }
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                  )
                }
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="size-8" />;
                }

                const isStart = sameDay(day, rangeStart);
                const isEnd = sameDay(day, rangeEnd);
                const isSelected = isStart || isEnd;
                const isToday = sameDay(day, today);
                const isFuture = day > today;
                const isInRange = inRange(day) && !isSelected;

                return (
                  <button
                    key={toKey(day)}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "size-8 rounded-[6px] text-[12px] font-medium tabular-nums transition-colors",
                      isFuture && "cursor-not-allowed opacity-30",
                      !isFuture &&
                        !isSelected &&
                        !isInRange &&
                        "text-foreground hover:bg-brand/10 hover:text-brand",
                      isToday && !isSelected && "ring-1 ring-brand/30",
                      isInRange && "bg-brand/10 text-brand",
                      isSelected &&
                        "bg-brand text-brand-foreground shadow-brand hover:bg-brand"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
              <p className="text-[10px] text-muted-foreground">
                {picking === "from" ? "Select start date" : "Select end date"}
              </p>
              <Button
                type="button"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => applyRange(draftFrom, draftTo)}
              >
                Apply
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <SearchableSelect
          value={surveyId}
          onChange={onSurveyChange}
          options={surveyOptions}
          placeholder="All Surveys"
          searchPlaceholder="Search surveys…"
          emptyMessage="No surveys found"
          aria-label="Filter by survey"
          className="h-8 w-[min(200px,40vw)] text-sm"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => onReorderModeChange?.(!reorderMode)}
          className={cn(
            "h-8 gap-1.5 px-2.5 text-sm",
            reorderMode && "border-brand/40 bg-brand/5 text-brand"
          )}
        >
          <GripVertical className="size-3.5" />
          {reorderMode ? "Done" : "Reorder"}
        </Button>

        {reorderMode && onResetLayout ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetLayout}
            className="h-8 gap-1.5 px-2.5 text-sm"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={isExporting}
          className="h-8 gap-1.5 px-2.5 text-sm"
        >
          <FileText className="size-3.5" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
