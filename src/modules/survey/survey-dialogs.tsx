"use client";

/**
 * survey-dialogs.tsx
 * Shared dialogs — delete, schedule, status badge, schedule fields.
 * No direct API calls — parent page calls deleteSurvey / scheduleSurvey.
 */

import { DEFAULT_SURVEY_SCHEDULE, getSurveySchedule } from "./survey-lib";
import type { SurveyDisplayStatus } from "./survey-lib";
import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { AgentSchedule as SurveySchedule, Agent as Survey } from "@/types/agent";
import { CalendarClock, CalendarX, AlertTriangle, Ban, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_STYLES: Record<
  SurveyDisplayStatus,
  { label: string; className: string; dotClassName?: string }
> = {
  draft: {
    label: "Draft",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  scheduled: {
    label: "Scheduled",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },
  processing: {
    label: "Processing",
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    dotClassName: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dotClassName: "bg-slate-500",
  },
};

interface SurveyStatusBadgeProps {
  status: SurveyDisplayStatus;
  className?: string;
  withDot?: boolean;
  size?: "sm" | "md";
}

export function SurveyStatusBadge({
  status,
  className,
  withDot = false,
  size = "sm",
}: SurveyStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-[11px]",
        style.className,
        className
      )}
    >
      {withDot && style.dotClassName ? (
        <span
          className={cn("size-1.5 animate-pulse rounded-full", style.dotClassName)}
        />
      ) : null}
      {style.label}
    </span>
  );
}


const CALL_WINDOW_MIN = "09:00";
const CALL_WINDOW_MAX = "18:00";

export interface ScheduleFormValues {
  enabled: boolean;
  startAt: string;
  endAt: string;
  callWindowStart: string;
  callWindowEnd: string;
}

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultStartLocal(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalInputValue(d.toISOString());
}

function timeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || "").trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeCallWindow(start: string, end: string): {
  callWindowStart: string;
  callWindowEnd: string;
  error?: string;
} {
  const callWindowStart = String(start || "").trim() || CALL_WINDOW_MIN;
  const callWindowEnd = String(end || "").trim() || CALL_WINDOW_MAX;
  const startMins = timeToMinutes(callWindowStart);
  const endMins = timeToMinutes(callWindowEnd);
  const minMins = timeToMinutes(CALL_WINDOW_MIN)!;
  const maxMins = timeToMinutes(CALL_WINDOW_MAX)!;

  if (startMins == null || endMins == null) {
    return {
      callWindowStart,
      callWindowEnd,
      error: "Timing limit must use HH:mm (e.g. 09:00)",
    };
  }
  if (startMins < minMins || endMins > maxMins) {
    return {
      callWindowStart,
      callWindowEnd,
      error: "Timing limit must stay between 09:00 and 18:00",
    };
  }
  if (startMins >= endMins) {
    return {
      callWindowStart,
      callWindowEnd,
      error: "Timing limit start must be before end",
    };
  }
  return { callWindowStart, callWindowEnd };
}

export function createEmptyScheduleForm(): ScheduleFormValues {
  return {
    enabled: false,
    startAt: defaultStartLocal(),
    endAt: "",
    callWindowStart: CALL_WINDOW_MIN,
    callWindowEnd: CALL_WINDOW_MAX,
  };
}

export function scheduleToFormValues(
  schedule?: SurveySchedule | null
): ScheduleFormValues {
  const s = schedule ?? DEFAULT_SURVEY_SCHEDULE;
  const hasStart = Boolean(s.startAt);

  return {
    enabled: hasStart ? Boolean(s.enabled) : false,
    startAt: toLocalInputValue(s.startAt) || defaultStartLocal(),
    endAt: toLocalInputValue(s.endAt),
    callWindowStart: s.callWindowStart || CALL_WINDOW_MIN,
    callWindowEnd: s.callWindowEnd || CALL_WINDOW_MAX,
  };
}

/** Validate + convert local form values to API payload. Returns error string or payload. */
export function parseScheduleForm(
  values: ScheduleFormValues
):
  | { ok: true; payload: { enabled: false } }
  | {
      ok: true;
      payload: {
        enabled: true;
        startAt: string;
        endAt: string | null;
        callWindowStart: string;
        callWindowEnd: string;
      };
    }
  | { ok: false; error: string }
{
  if (!values.enabled) return { ok: true, payload: { enabled: false } };

  if (!values.startAt) {
    return { ok: false, error: "Start date & time is required to schedule" };
  }

  const startDate = new Date(values.startAt);
  if (Number.isNaN(startDate.getTime())) {
    return { ok: false, error: "Invalid start date" };
  }

  let endIso: string | null = null;
  if (values.endAt) {
    const endDate = new Date(values.endAt);
    if (Number.isNaN(endDate.getTime())) {
      return { ok: false, error: "Invalid end date" };
    }
    if (endDate <= startDate) {
      return { ok: false, error: "End must be after start" };
    }
    endIso = endDate.toISOString();
  }

  const window = normalizeCallWindow(
    values.callWindowStart,
    values.callWindowEnd
  );
  if (window.error) {
    return { ok: false, error: window.error };
  }

  return {
    ok: true,
    payload: {
      enabled: true,
      startAt: startDate.toISOString(),
      endAt: endIso,
      callWindowStart: window.callWindowStart,
      callWindowEnd: window.callWindowEnd,
    },
  };
}

interface SurveyScheduleFieldsProps {
  values: ScheduleFormValues;
  onChange: (values: ScheduleFormValues) => void;
  /** Create vs edit copy */
  mode?: "create" | "edit";
  /** When true, schedule cannot be changed (already scheduled) */
  readOnly?: boolean;
  onUnschedule?: () => void;
  isUnscheduling?: boolean;
}

export function SurveyScheduleFields({
  values,
  onChange,
  mode = "create",
  readOnly = false,
  onUnschedule,
  isUnscheduling = false,
}: SurveyScheduleFieldsProps) {
  const update = <K extends keyof ScheduleFormValues>(
    key: K,
    value: ScheduleFormValues[K]
  ) => {
    if (readOnly) return;
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-[8px] border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <CalendarClock className="size-4 text-primary" />
            Schedule survey
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {readOnly
              ? "This survey is already scheduled. Schedule cannot be changed."
              : mode === "edit"
                ? "Optionally schedule this survey to run."
                : "Optionally set when this survey should run after create."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {readOnly && onUnschedule ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUnschedule}
              disabled={isUnscheduling}
              className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800"
            >
              {isUnscheduling ? (
                <AppLoaderSpinner size="sm" />
              ) : (
                <CalendarX className="size-3.5" />
              )}
              {isUnscheduling ? "Unscheduling…" : "Unschedule"}
            </Button>
          ) : null}
          <Switch
            checked={values.enabled}
            onCheckedChange={(checked) => update("enabled", checked)}
            disabled={readOnly}
          />
        </div>
      </div>

      {values.enabled ? (
        <div className="space-y-4 border-t border-border/50 pt-4">
          <div className="space-y-2">
            <Label htmlFor="inline-schedule-start">Start date &amp; time</Label>
            <Input
              id="inline-schedule-start"
              type="datetime-local"
              value={values.startAt}
              onChange={(e) => update("startAt", e.target.value)}
              className="rounded-[6px]"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inline-schedule-end">
              End date &amp; time (optional)
            </Label>
            <Input
              id="inline-schedule-end"
              type="datetime-local"
              value={values.endAt}
              onChange={(e) => update("endAt", e.target.value)}
              className="rounded-[6px]"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Timing limit (call window)</Label>
            <p className="text-[11px] text-muted-foreground">
              Calls run only between these times. Default 09:00–18:00; customize
              within that range.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inline-schedule-window-start">From</Label>
                <Input
                  id="inline-schedule-window-start"
                  type="time"
                  min={CALL_WINDOW_MIN}
                  max={CALL_WINDOW_MAX}
                  step={60}
                  value={values.callWindowStart}
                  onChange={(e) => update("callWindowStart", e.target.value)}
                  className="rounded-[6px]"
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inline-schedule-window-end">To</Label>
                <Input
                  id="inline-schedule-window-end"
                  type="time"
                  min={CALL_WINDOW_MIN}
                  max={CALL_WINDOW_MAX}
                  step={60}
                  value={values.callWindowEnd}
                  onChange={(e) => update("callWindowEnd", e.target.value)}
                  className="rounded-[6px]"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Turn on to set start time and daily timing limit (default 9 AM–6 PM).
        </p>
      )}
    </div>
  );
}

export interface ScheduleSurveyPayload {
  startAt: string;
  endAt: string | null;
  callWindowStart: string;
  callWindowEnd: string;
}

interface ScheduleSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey | null;
  onConfirm: (payload: ScheduleSurveyPayload) => void | Promise<void>;
  /** Show Skip when opened right after create wizard */
  allowSkip?: boolean;
  onSkip?: () => void;
}

export function ScheduleSurveyDialog({
  open,
  onOpenChange,
  survey,
  onConfirm,
  allowSkip = false,
  onSkip,
}: ScheduleSurveyDialogProps) {
  const [startAt, setStartAt] = useState(defaultStartLocal);
  const [endAt, setEndAt] = useState("");
  const [callWindowStart, setCallWindowStart] = useState(CALL_WINDOW_MIN);
  const [callWindowEnd, setCallWindowEnd] = useState(CALL_WINDOW_MAX);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !survey) return;
    const schedule = getSurveySchedule(survey);
    setStartAt(toLocalInputValue(schedule.startAt) || defaultStartLocal());
    setEndAt(toLocalInputValue(schedule.endAt));
    setCallWindowStart(schedule.callWindowStart || CALL_WINDOW_MIN);
    setCallWindowEnd(schedule.callWindowEnd || CALL_WINDOW_MAX);
    setError("");
    setIsSaving(false);
  }, [open, survey]);

  if (!survey) return null;

  const handleConfirm = async () => {
    if (!startAt) {
      setError("Start date & time is required");
      return;
    }

    const startDate = new Date(startAt);
    if (Number.isNaN(startDate.getTime())) {
      setError("Invalid start date");
      return;
    }

    let endIso: string | null = null;
    if (endAt) {
      const endDate = new Date(endAt);
      if (Number.isNaN(endDate.getTime())) {
        setError("Invalid end date");
        return;
      }
      if (endDate <= startDate) {
        setError("End must be after start");
        return;
      }
      endIso = endDate.toISOString();
    }

    const window = normalizeCallWindow(callWindowStart, callWindowEnd);
    if (window.error) {
      setError(window.error);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onConfirm({
        startAt: startDate.toISOString(),
        endAt: endIso,
        callWindowStart: window.callWindowStart,
        callWindowEnd: window.callWindowEnd,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" />
            Schedule survey
          </DialogTitle>
          <DialogDescription>
            Set when{" "}
            <span className="font-medium text-foreground">{survey.name}</span>{" "}
            should run.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="schedule-start">Start date &amp; time</Label>
            <Input
              id="schedule-start"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="rounded-[6px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-end">End date &amp; time (optional)</Label>
            <Input
              id="schedule-end"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="rounded-[6px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Timing limit (call window)</Label>
            <p className="text-[11px] text-muted-foreground">
              Default 09:00–18:00. Customize only within that range.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-window-start">From</Label>
                <Input
                  id="schedule-window-start"
                  type="time"
                  min={CALL_WINDOW_MIN}
                  max={CALL_WINDOW_MAX}
                  step={60}
                  value={callWindowStart}
                  onChange={(e) => setCallWindowStart(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-window-end">To</Label>
                <Input
                  id="schedule-window-end"
                  type="time"
                  min={CALL_WINDOW_MIN}
                  max={CALL_WINDOW_MAX}
                  step={60}
                  value={callWindowEnd}
                  onChange={(e) => setCallWindowEnd(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {allowSkip ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSkip?.()}
              disabled={isSaving}
            >
              Skip for now
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <AppLoaderSpinner size="sm" />
            ) : (
              "Schedule survey"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: Survey | null;
  surveys?: Survey[];
  onConfirm: () => void;
  isDeleting?: boolean;
}

function surveyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Delete one or many surveys — used from list page */
export function DeleteSurveyDialog({
  open,
  onOpenChange,
  survey = null,
  surveys = [],
  onConfirm,
  isDeleting,
}: DeleteSurveyDialogProps) {
  const isBulk = !survey && surveys.length > 0;
  const items = survey ? [survey] : surveys;
  const count = items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden border-destructive/20 p-0 shadow-elevated sm:max-w-[420px]",
          "data-[state=open]:zoom-in-95"
        )}
      >
        <div className="relative overflow-hidden border-b border-destructive/15 bg-linear-to-b from-destructive/12 via-destructive/5 to-transparent px-6 pb-5 pt-7">
          <DialogHeader className="relative items-center gap-4 text-center sm:items-center sm:text-center">
            <div className="relative">
              <span className="relative flex size-16 items-center justify-center rounded-[6px] bg-card text-destructive shadow-elevated ring-1 ring-destructive/25">
                <Trash2 className="size-7" strokeWidth={1.75} />
                <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-subtle ring-2 ring-card">
                  <AlertTriangle className="size-3.5" strokeWidth={2.5} />
                </span>
              </span>
            </div>
            <div className="space-y-2">
              <DialogTitle className="font-display text-xl font-semibold tracking-tight text-foreground">
                {isBulk
                  ? `Delete ${count} survey${count === 1 ? "" : "s"}?`
                  : "Delete this survey?"}
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[320px] text-sm leading-relaxed text-muted-foreground">
                {isBulk ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {count} survey{count === 1 ? "" : "s"}
                    </span>{" "}
                    will be permanently removed.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {survey?.name ?? "This survey"}
                    </span>{" "}
                    will be permanently removed. This cannot be undone.
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {count > 0 ? (
          <div className="space-y-2.5 px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {isBulk ? "Will be deleted" : "Survey"}
              </p>
              {isBulk ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive ring-1 ring-destructive/20">
                  <Ban className="size-3" />
                  {count} selected
                </span>
              ) : null}
            </div>
            <ul className="max-h-44 space-y-2 overflow-y-auto pr-0.5">
              {items.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-[6px] border border-border/60 bg-muted/30 px-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-destructive/10 font-display text-[11px] font-bold text-destructive ring-1 ring-destructive/15">
                    {surveyInitials(item.name)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter className="gap-2 border-t border-border/50 bg-muted/25 px-6 py-4 sm:flex-row sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-[6px]"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Keep surveys
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1 rounded-[6px] gap-1.5 font-semibold"
            onClick={onConfirm}
            disabled={isDeleting || count === 0}
          >
            {isDeleting ? (
              <AppLoaderSpinner size="sm" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isDeleting ? "Deleting…" : isBulk ? `Yes, delete ${count}` : "Yes, delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
