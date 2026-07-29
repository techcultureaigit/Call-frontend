"use client";

import { CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AgentSchedule, AgentScheduleRecurrence } from "@/types/agent";
import { DEFAULT_AGENT_SCHEDULE } from "@/lib/utils/survey-readiness";

const RECURRENCE_OPTIONS = [
  { label: "Once", value: "once" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const TIMEZONE_OPTIONS = [
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "UTC", value: "UTC" },
  { label: "America/New_York (ET)", value: "America/New_York" },
  { label: "Europe/London (GMT)", value: "Europe/London" },
];

export interface ScheduleFormValues {
  enabled: boolean;
  startAt: string;
  endAt: string;
  timezone: string;
  recurrence: AgentScheduleRecurrence;
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

export function createEmptyScheduleForm(): ScheduleFormValues {
  return {
    enabled: false,
    startAt: "",
    endAt: "",
    timezone: "Asia/Kolkata",
    recurrence: "once",
  };
}

export function scheduleToFormValues(
  schedule?: AgentSchedule | null
): ScheduleFormValues {
  const s = schedule ?? DEFAULT_AGENT_SCHEDULE;
  const hasStart = Boolean(s.startAt);

  return {
    enabled: hasStart ? Boolean(s.enabled) : false,
    startAt: toLocalInputValue(s.startAt),
    endAt: toLocalInputValue(s.endAt),
    timezone: s.timezone || "Asia/Kolkata",
    recurrence: s.recurrence || "once",
  };
}

/** Validate + convert local form values to API payload. Returns error string or payload. */
export function parseScheduleForm(
  values: ScheduleFormValues
):
  | { ok: true; payload: { enabled: false } }
  | { ok: true; payload: { enabled: true; startAt: string; endAt: string | null; timezone: string; recurrence: AgentScheduleRecurrence } }
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

  return {
    ok: true,
    payload: {
      enabled: true,
      startAt: startDate.toISOString(),
      endAt: endIso,
      timezone: values.timezone || "Asia/Kolkata",
      recurrence: values.recurrence || "once",
    },
  };
}

interface SurveyScheduleFieldsProps {
  values: ScheduleFormValues;
  onChange: (values: ScheduleFormValues) => void;
  /** Create vs edit copy */
  mode?: "create" | "edit";
}

export function SurveyScheduleFields({
  values,
  onChange,
  mode = "create",
}: SurveyScheduleFieldsProps) {
  const update = <K extends keyof ScheduleFormValues>(
    key: K,
    value: ScheduleFormValues[K]
  ) => onChange({ ...values, [key]: value });

  return (
    <div className="space-y-4 rounded-[8px] border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <CalendarClock className="size-4 text-primary" />
            Schedule survey
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "edit"
              ? "Update when this survey should run. You can change this anytime."
              : "Set when this survey should run after create. You can change it later from My Surveys."}
          </p>
        </div>
        <Switch
          checked={values.enabled}
          onCheckedChange={(checked) => update("enabled", checked)}
        />
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
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inline-schedule-recurrence">Recurrence</Label>
              <Select
                id="inline-schedule-recurrence"
                options={RECURRENCE_OPTIONS}
                value={values.recurrence}
                onChange={(e) =>
                  update("recurrence", e.target.value as AgentScheduleRecurrence)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inline-schedule-timezone">Timezone</Label>
              <Select
                id="inline-schedule-timezone"
                options={TIMEZONE_OPTIONS}
                value={values.timezone}
                onChange={(e) => update("timezone", e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Turn on to set start time, recurrence, and timezone
          {mode === "edit" ? " (or leave off to keep current / skip)." : "."}
        </p>
      )}
    </div>
  );
}
