"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Agent, AgentScheduleRecurrence } from "@/types/agent";
import {
  getSurveySchedule,
  isSurveyScheduled,
} from "@/lib/utils/survey-readiness";

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

export interface ScheduleSurveyPayload {
  startAt: string;
  endAt: string | null;
  timezone: string;
  recurrence: AgentScheduleRecurrence;
}

interface ScheduleSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onConfirm: (payload: ScheduleSurveyPayload) => void | Promise<void>;
  onUnschedule?: () => void | Promise<void>;
  /** Show Skip when opened right after create wizard */
  allowSkip?: boolean;
  onSkip?: () => void;
}

export function ScheduleSurveyDialog({
  open,
  onOpenChange,
  agent,
  onConfirm,
  onUnschedule,
  allowSkip = false,
  onSkip,
}: ScheduleSurveyDialogProps) {
  const [startAt, setStartAt] = useState(defaultStartLocal);
  const [endAt, setEndAt] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [recurrence, setRecurrence] =
    useState<AgentScheduleRecurrence>("once");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isReschedule = useMemo(
    () => (agent ? isSurveyScheduled(agent) : false),
    [agent]
  );

  useEffect(() => {
    if (!open || !agent) return;
    const schedule = getSurveySchedule(agent);
    setStartAt(toLocalInputValue(schedule.startAt) || defaultStartLocal());
    setEndAt(toLocalInputValue(schedule.endAt));
    setTimezone(schedule.timezone || "Asia/Kolkata");
    setRecurrence(schedule.recurrence || "once");
    setError("");
    setIsSaving(false);
  }, [open, agent]);

  if (!agent) return null;

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

    setError("");
    setIsSaving(true);
    try {
      await onConfirm({
        startAt: startDate.toISOString(),
        endAt: endIso,
        timezone,
        recurrence,
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
            {isReschedule ? "Reschedule survey" : "Schedule survey"}
          </DialogTitle>
          <DialogDescription>
            Set when{" "}
            <span className="font-medium text-foreground">{agent.name}</span>{" "}
            should run. You can reschedule anytime from My Surveys.
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-recurrence">Recurrence</Label>
              <Select
                id="schedule-recurrence"
                options={RECURRENCE_OPTIONS}
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as AgentScheduleRecurrence)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-timezone">Timezone</Label>
              <Select
                id="schedule-timezone"
                options={TIMEZONE_OPTIONS}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
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
          {isReschedule ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onUnschedule?.()}
              disabled={isSaving}
              className="text-destructive hover:text-destructive"
            >
              Unschedule
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isReschedule ? (
              "Update schedule"
            ) : (
              "Schedule survey"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
