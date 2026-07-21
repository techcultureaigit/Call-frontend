"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function formatDisplayDate(value: string) {
  const date = parseKey(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => toKey(new Date()));
  const [viewMonth, setViewMonth] = useState(() => parseKey(toKey(new Date())));
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => parseKey(selectedDate), [selectedDate]);
  const cells = useMemo(() => getMonthCells(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
         Survey Dashboard
        </h2>
        
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) setViewMonth(new Date(selected));
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-[6px] border border-border/60 bg-card px-3",
                "text-[11px] font-medium text-muted-foreground shadow-subtle outline-none",
                "transition-colors hover:border-brand/30 hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-brand/25",
                open && "border-brand/40 text-foreground"
              )}
            >
              <CalendarDays className="size-3.5 shrink-0 text-brand" />
              <span className="min-w-[8.5rem] whitespace-nowrap tabular-nums text-foreground">
                {formatDisplayDate(selectedDate)}
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
            className="w-[280px] rounded-[6px] p-3"
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

                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, today);
                const isFuture = day > today;

                return (
                  <button
                    key={toKey(day)}
                    type="button"
                    disabled={isFuture}
                    onClick={() => {
                      setSelectedDate(toKey(day));
                      setOpen(false);
                    }}
                    className={cn(
                      "size-8 rounded-[6px] text-[12px] font-medium tabular-nums transition-colors",
                      isFuture && "cursor-not-allowed opacity-30",
                      !isFuture &&
                        !isSelected &&
                        "text-foreground hover:bg-brand/10 hover:text-brand",
                      isToday && !isSelected && "ring-1 ring-brand/30",
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
              <button
                type="button"
                className="text-[11px] font-semibold text-brand hover:underline"
                onClick={() => {
                  const key = toKey(today);
                  setSelectedDate(key);
                  setViewMonth(new Date(today));
                  setOpen(false);
                }}
              >
                Today
              </button>
              <span className="text-[10px] text-muted-foreground">
                Select a date to filter
              </span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

       
        
      </div>
    </div>
  );
}
