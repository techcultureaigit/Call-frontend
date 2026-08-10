"use client";

/**
 * survey-response.tsx
 * Survey call results — list and detail.
 * Route: /survey/[id]/results, /survey/[id]/results/[resultId]
 *
 * API calls in this file:
 *   listSurveyResults()    → GET /api/surveys/:id/results
 *   exportSurveyResults()  → GET /api/surveys/:id/results/export
 *   getSurveyResult()      → GET /api/surveys/:id/results/:resultId
 */

import {
  listSurveyResults,
  exportSurveyResults,
  getSurveyResult,
} from "./api";
import type {
  SurveyResultsExportFormat,
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultRow,
  SurveyResultsSurveyMeta,
} from "./survey-types";
import { SurveyFetchLoader } from "./survey-by-id";
import type { SurveyDisplayStatus } from "./survey-lib";
import { SurveyStatusBadge } from "./survey-dialogs";
import { PageContainer } from "@/components/layout";
import { DataPagination } from "@/components/shared/data-pagination";
import {
  DataTableActionButton,
  DataTableMetaChip,
} from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageMeta, usePermissions, usePaginatedList } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Clock3, Download, Eye, FileSpreadsheet, FileText, HelpCircle, MessageSquareText, Phone, Sparkles, Users, MessageCircle, Pause, Play, UserRound, PhoneCall, Radio, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";

/** Results table / popup palette — neutral theme (no orange/peach) */
const QA_MODAL = {
  rowOdd: "#ffffff",
  rowEven: "#f8fafc",
  border: "#e5e7eb",
  headerBorder: "#e5e7eb",
  text: "#0f172a",
  muted: "#64748b",
  more: "var(--primary, #0d9488)",
  tableHeaderBg: "#1e293b",
  badgeBg: "#0f172a",
} as const;

/** Exact call_recordings field names (shown as column headers) */
const CALL_EXACT_FIELDS = [
  "direction",
  "call_connected",
  "billing_circle.operator",
  "billing_circle.circle",
  "start_stamp",
  "answer_stamp",
  "end_stamp",
  "agent_number",
  "agent_ring_time",
  "agent_transfer_ring_time",
  "customer_ring_time",
  "outbound_sec",
  "caller_id_number",
  "call_to_number",
  "customer_no_with_prefix",
  "hangup_cause_description",
  "reason_key",
  "campaign_name",
  "custom_identifier",
  "answered_agent_name",
  "answered_agent_number",
  "missed_agent",
  "digits_dialed",
  "broadcast_lead_fields",
  "received_at",
] as const;

/** Status / duration shown in dedicated columns — skip as extra call cols */
const CALL_CORE_SKIP = new Set(["call_status", "duration", "billsec"]);

function getCallFieldValue(
  call: SurveyResultRow["call"],
  key: string
): string {
  if (!call) return "";
  if (key === "billing_circle.operator") {
    return call.billing_circle?.operator?.trim() || "";
  }
  if (key === "billing_circle.circle") {
    return call.billing_circle?.circle?.trim() || "";
  }
  const record = call as unknown as Record<string, unknown>;
  const raw = record[key];
  if (raw == null || raw === "") return "";
  if (typeof raw === "object") return "";
  return String(raw);
}

function getCallDisplayFields(
  call: SurveyResultRow["call"]
): { key: string; label: string; value: string }[] {
  if (!call) return [];
  return CALL_EXACT_FIELDS.map((key) => {
    const value = getCallFieldValue(call, key);
    return { key, label: key, value };
  }).filter((f) => f.value && !CALL_CORE_SKIP.has(f.key));
}

interface SurveyResultsViewProps {
  surveyId: string;
}

function resolveOptionLabel(
  question: SurveyResultQuestionMeta | undefined,
  raw: unknown
): string {
  if (raw == null || raw === "") return "";
  const value = String(raw);
  const options = question?.options ?? [];
  if (!options.length) return value;
  const match = options.find(
    (opt) =>
      String(opt.value) === value ||
      String(opt.label).toLowerCase() === value.toLowerCase()
  );
  return match?.label || value;
}

function enrichRowAnswers(
  row: SurveyResultRow,
  questions: SurveyResultQuestionMeta[]
): SurveyResultAnswer[] {
  if (row.answers?.length) {
    return row.answers.map((a) => ({
      ...a,
      question:
        a.question && a.question !== a.questionId
          ? a.question
          : questions.find((q) => q.id === a.questionId)?.question || a.question,
      recording_url:
        a.recording_url ||
        resolveAnswerRecordingUrl(a, null) ||
        undefined,
    }));
  }

  const extracted = row.extracted_data ?? {};
  const ordered = questions.length
    ? [
        ...questions.map((q) => q.id),
        ...Object.keys(extracted).filter(
          (id) => !questions.some((q) => q.id === id)
        ),
      ]
    : Object.keys(extracted);

  return ordered
    .filter((id) => Object.prototype.hasOwnProperty.call(extracted, id))
    .map((questionId) => {
      const meta = questions.find((q) => q.id === questionId);
      const raw = extracted[questionId];
      const built: SurveyResultAnswer = {
        questionId,
        question: meta?.question || questionId,
        type: meta?.type || "text",
        answer: resolveOptionLabel(meta, raw),
        rawAnswer: raw,
      };
      const recording = resolveAnswerRecordingUrl(built, null);
      return recording ? { ...built, recording_url: recording } : built;
    });
}

function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Compact audio player matching reference AUDIO column (image 2) */
function InlineRecordingPlayer({
  src,
  durationSeconds: durationHint,
  fullWidth = false,
}: {
  src: string;
  durationSeconds?: number | null;
  fullWidth?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(
    typeof durationHint === "number" && durationHint > 0 ? durationHint : 0
  );

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    setDuration(
      typeof durationHint === "number" && durationHint > 0 ? durationHint : 0
    );
  }, [src, durationHint]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime || 0);
    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
      }
    };
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[6px] border border-border/50 bg-muted/30 px-2.5 py-1.5",
        fullWidth ? "w-full" : "mx-auto w-full min-w-[180px] max-w-[260px]"
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={playing ? "Pause recording" : "Play recording"}
      >
        {playing ? (
          <Pause className="size-4" fill="currentColor" />
        ) : (
          <Play className="size-4" fill="currentColor" />
        )}
      </button>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {formatPlayerTime(current)}
      </span>
      <div
        className="relative h-1.5 min-w-0 flex-1 cursor-pointer rounded-full bg-border/70"
        onClick={seek}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(current)}
        tabIndex={0}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-sm"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {formatPlayerTime(duration)}
      </span>
    </div>
  );
}

function resolveAnswerRecordingUrl(
  answer: SurveyResultAnswer,
  rowRecording?: string | null
): string | null {
  if (answer.recording_url) return answer.recording_url;
  const raw = answer.rawAnswer;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["recording_url", "recordingUrl", "audio_url", "audioUrl", "url"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return rowRecording || null;
}

function QuestionNumberPopup({
  open,
  onClose,
  number,
  question,
}: {
  open: boolean;
  onClose: () => void;
  number: number;
  question: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close question popup"
        onClick={onClose}
      />
      <div
        className="relative z-[61] w-full max-w-md overflow-hidden rounded-[16px] bg-white shadow-2xl"
        style={{ color: QA_MODAL.text }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: QA_MODAL.headerBorder }}
        >
          <h2
            id="question-popup-title"
            className="text-base font-bold"
            style={{ color: QA_MODAL.text }}
          >
            Question {number}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            Close
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <p className="text-center text-sm leading-relaxed">
            {question || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function TruncatedQuestionCell({
  number,
  question,
  onNumberClick,
}: {
  number: number;
  question: string;
  onNumberClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = question.length > 90;
  const shown =
    !needsTruncate || expanded ? question : `${question.slice(0, 90).trimEnd()}…`;

  return (
    <div className="flex min-w-0 items-start gap-3 text-left">
      <button
        type="button"
        onClick={onNumberClick}
        className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold tabular-nums text-primary transition-colors hover:bg-primary/15"
        title="View full question"
        aria-label={`View question ${number}`}
      >
        {number}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">{shown}</p>
        {needsTruncate ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] font-semibold text-primary hover:underline"
          >
            {expanded ? "Less" : "More"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CallInfoChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="rounded-[6px] border border-border/50 bg-card/80 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {Icon ? <Icon className="size-3 opacity-70" /> : null}
        {label}
      </div>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground" title={value}>
        {value || "---"}
      </p>
    </div>
  );
}

/** Eye-icon popup — wider, sectioned layout */
function ResponseDetailsModal({
  open,
  onOpenChange,
  row,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: SurveyResultRow | null;
}) {
  const answers = row?.answers ?? [];
  const rowRecording = row?.recording_url ?? null;
  const durationSeconds =
    row?.recording_duration_seconds ?? null;
  const call = row?.call ?? null;

  const callChips = useMemo(() => {
    if (!call) return [] as { label: string; value: string; icon?: typeof Phone }[];
    const chips: { label: string; value: string; icon?: typeof Phone }[] = [];
    const push = (
      label: string,
      value: string | undefined,
      icon?: typeof Phone
    ) => {
      if (!value) return;
      chips.push({ label, value, icon });
    };

    push("call_status", call.call_status, Radio);
    push("duration", call.duration, Clock3);
    push("billsec", call.billsec, Clock3);
    push("direction", call.direction, PhoneCall);
    push(
      "call_connected",
      call.call_connected === "1"
        ? "Yes"
        : call.call_connected === "0"
          ? "No"
          : call.call_connected,
      Radio
    );
    push(
      "billing_circle.operator",
      call.billing_circle?.operator,
      MapPin
    );
    push("billing_circle.circle", call.billing_circle?.circle, MapPin);
    push("start_stamp", call.start_stamp, CalendarClock);
    push("answer_stamp", call.answer_stamp, CalendarClock);
    push("end_stamp", call.end_stamp, CalendarClock);
    push("agent_number", call.agent_number, UserRound);
    push("agent_ring_time", call.agent_ring_time);
    push("agent_transfer_ring_time", call.agent_transfer_ring_time);
    push("customer_ring_time", call.customer_ring_time);
    push("outbound_sec", call.outbound_sec);
    push("caller_id_number", call.caller_id_number, Phone);
    push("call_to_number", call.call_to_number, Phone);
    push("customer_no_with_prefix", call.customer_no_with_prefix, Phone);
    push("hangup_cause_description", call.hangup_cause_description);
    push("reason_key", call.reason_key);
    push("campaign_name", call.campaign_name);
    push("custom_identifier", call.custom_identifier);
    push("answered_agent_name", call.answered_agent_name, UserRound);
    push("answered_agent_number", call.answered_agent_number, Phone);
    push("missed_agent", call.missed_agent);
    push("digits_dialed", call.digits_dialed);
    push("broadcast_lead_fields", call.broadcast_lead_fields);
    push("received_at", call.received_at, CalendarClock);
    return chips;
  }, [call]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(96vw,980px)] max-w-none flex-col gap-0 overflow-hidden border border-border/60 bg-card p-0 shadow-elevated sm:rounded-[8px]">
        <div className="relative shrink-0 overflow-hidden border-b border-border/50">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_55%)]"
          />
          <DialogHeader className="relative px-6 py-5 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="min-w-0 space-y-2">
                <DialogTitle className="font-display text-xl font-semibold tracking-tight text-foreground">
                  Response details
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/50">
                      <Phone className="size-3.5 text-primary" />
                      {row?.customer_number || "—"}
                    </span>
                    {row?.customer_name ? (
                      <span className="text-xs text-muted-foreground">
                        {row.customer_name}
                      </span>
                    ) : null}
                    <CallStatusPill status={call?.call_status} />
                    {answers.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
                        <MessageCircle className="size-3" />
                        {answers.length} answers
                      </span>
                    ) : null}
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          {callChips.length ? (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Call overview
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {callChips.length} fields
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {callChips.map((chip) => (
                  <CallInfoChip
                    key={`${chip.label}-${chip.value}`}
                    label={chip.label}
                    value={chip.value}
                    icon={chip.icon}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Questions &amp; answers
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {answers.length} recorded
              </span>
            </div>

            <ResponseQaTable
              answers={answers}
              rowRecording={null}
              recordingDurationSeconds={durationSeconds}
              callMeta={null}
              embedded
              layout="detail"
            />
          </section>

          {rowRecording ? (
            <section className="flex flex-wrap items-center gap-2.5 rounded-[8px] border border-border/50 bg-muted/15 px-3 py-2">
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-[6px] border border-primary/20 bg-primary/10 text-primary">
                  <Radio className="size-3.5" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                  Recording
                </p>
              </div>
              <div className="w-full max-w-[280px] sm:w-[280px]">
                <InlineRecordingPlayer
                  src={rowRecording}
                  durationSeconds={durationSeconds}
                  fullWidth
                />
              </div>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CallStatusPill({ status }: { status?: string }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">---</span>;
  }
  const normalized = status.trim().toLowerCase();
  const answered = normalized === "answered";
  const missed = normalized === "missed";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        answered &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
        missed && "border-rose-500/25 bg-rose-500/10 text-rose-700",
        !answered &&
          !missed &&
          "border-border/60 bg-muted/50 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          answered && "bg-emerald-500",
          missed && "bg-rose-500",
          !answered && !missed && "bg-muted-foreground/50"
        )}
      />
      {status}
    </span>
  );
}

/** Results table — same shell/pattern as My Surveys DataTable */
function ResultsInlineQaTable({
  rows,
  questionColumns,
}: {
  rows: SurveyResultRow[];
  questionColumns: { id: string; question: string }[];
}) {
  const [questionPopup, setQuestionPopup] = useState<{
    number: number;
    question: string;
  } | null>(null);
  const [detailsRow, setDetailsRow] = useState<SurveyResultRow | null>(null);
  const [expandedHeaders, setExpandedHeaders] = useState<
    Record<string, boolean>
  >({});

  const callColumns = useMemo(() => {
    return CALL_EXACT_FIELDS.filter((key) =>
      rows.some((row) => Boolean(getCallFieldValue(row.call, key)))
    ).map((key) => ({ key, label: key }));
  }, [rows]);

  const statusAccent = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "answered") return "bg-emerald-500";
    if (s === "missed") return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-[6px] border border-border/60 bg-card/95 shadow-elevated backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_14%,transparent),transparent_55%)]"
        />

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40">
                <th className="w-12 px-3.5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Phone
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Contact
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Duration
                </th>
                {callColumns.map((col) => (
                  <th
                    key={col.key}
                    className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {col.label}
                  </th>
                ))}
                {questionColumns.map((col, index) => {
                  const number = index + 1;
                  const expanded = Boolean(expandedHeaders[col.id]);
                  const needsTruncate = col.question.length > 36;
                  const label =
                    !needsTruncate || expanded
                      ? col.question
                      : `${col.question.slice(0, 36).trimEnd()}…`;
                  return (
                    <th
                      key={col.id}
                      className="min-w-[9rem] max-w-[14rem] px-4 py-3.5 text-center align-bottom text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-1.5 normal-case tracking-normal">
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionPopup({
                              number,
                              question: col.question,
                            })
                          }
                          className="inline-flex size-7 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold tabular-nums text-primary hover:bg-primary/15"
                          title="View full question"
                          aria-label={`View question ${number}`}
                        >
                          {number}
                        </button>
                        <span className="line-clamp-3 text-[11px] font-medium leading-snug text-foreground/80">
                          {label}
                        </span>
                        {needsTruncate ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHeaders((prev) => ({
                                ...prev,
                                [col.id]: !prev[col.id],
                              }))
                            }
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            {expanded ? "Less" : "More"}
                          </button>
                        ) : null}
                      </div>
                    </th>
                  );
                })}
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Audio
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const answerMap = new Map(
                  row.answers.map((a) => [a.questionId, a])
                );
                const rowRecording =
                  row.recording_url ||
                  row.answers
                    .map((a) => resolveAnswerRecordingUrl(a, null))
                    .find(Boolean) ||
                  null;

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.03, duration: 0.22 }}
                    className="group border-b border-border/30 transition-colors last:border-0 hover:bg-muted/25"
                  >
                    <td className="relative w-12 px-3.5 py-3.5 align-middle">
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full opacity-80 transition-opacity group-hover:opacity-100",
                          statusAccent(row.call?.call_status)
                        )}
                      />
                      <DataTableActionButton
                        label="View questions & answers"
                        onClick={() => setDetailsRow(row)}
                      >
                        <Eye className="size-3.5" />
                      </DataTableActionButton>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                      <DataTableMetaChip
                        icon={Phone}
                        label={row.customer_number || "—"}
                        tabular
                        className="max-w-none font-semibold text-foreground"
                      />
                    </td>
                    <td className="max-w-[10rem] px-4 py-3.5 align-middle">
                      <DataTableMetaChip
                        icon={UserRound}
                        label={row.customer_name || "Unknown contact"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                      <DataTableMetaChip
                        icon={CalendarClock}
                        label={
                          row.extracted_at
                            ? formatSurveyCreatedAt(row.extracted_at)
                            : "—"
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                      <CallStatusPill status={row.call?.call_status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                      <DataTableMetaChip
                        icon={Clock3}
                        label={
                          row.call?.billsec || row.call?.duration
                            ? `${row.call?.billsec || row.call?.duration}s`
                            : "---"
                        }
                        tabular
                      />
                    </td>
                    {callColumns.map((col) => {
                      const value = getCallFieldValue(row.call, col.key);
                      const display =
                        col.key === "call_connected"
                          ? value === "1"
                            ? "Yes"
                            : value === "0"
                              ? "No"
                              : value || "---"
                          : value || "---";
                      return (
                        <td
                          key={col.key}
                          className="max-w-[12rem] truncate px-4 py-3.5 align-middle text-xs text-muted-foreground"
                          title={display}
                        >
                          {display}
                        </td>
                      );
                    })}
                    {questionColumns.map((col) => {
                      const answer = answerMap.get(col.id);
                      const value = answer?.answer?.trim()
                        ? answer.answer
                        : "---";
                      return (
                        <td
                          key={col.id}
                          className="px-4 py-3.5 text-center align-middle text-sm font-medium text-foreground"
                        >
                          {value}
                        </td>
                      );
                    })}
                    <td className="min-w-[220px] px-4 py-3.5 align-middle">
                      {rowRecording ? (
                        <InlineRecordingPlayer
                          src={rowRecording}
                          durationSeconds={
                            row.recording_duration_seconds ?? null
                          }
                        />
                      ) : (
                        <span className="block text-center text-xs text-muted-foreground">
                          ---
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border/40 bg-muted/20 px-5 py-2.5">
          <p className="text-[11px] text-muted-foreground">
            Eye icon opens Q&amp;A popup · question numbers open full text · call
            fields shown without IDs/tracking
          </p>
        </div>
      </div>

      <QuestionNumberPopup
        open={Boolean(questionPopup)}
        onClose={() => setQuestionPopup(null)}
        number={questionPopup?.number ?? 0}
        question={questionPopup?.question ?? ""}
      />

      <ResponseDetailsModal
        open={Boolean(detailsRow)}
        onOpenChange={(open) => {
          if (!open) setDetailsRow(null);
        }}
        row={detailsRow}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  glowClass,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  glowClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[10px] border border-border/40 bg-card/95 px-4 py-3.5 shadow-sm">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100",
          glowClass
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-[8px] border border-primary/15 bg-primary/10">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
    </div>
  );
}

export function SurveyResponseView({ surveyId }: SurveyResultsViewProps) {
  const router = useRouter();
  const { canExportSurvey } = usePermissions();
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchPage = useCallback(
    async ({
      page,
      limit,
      search,
    }: {
      page: number;
      limit: number;
      search: string;
    }) => {
      try {
        // API: listSurveyResults() → GET /api/surveys/:id/results
        const res = await listSurveyResults(surveyId, {
          page,
          limit,
          search: search || undefined,
        });
        setSurvey(res.survey);
        return { data: res.data, meta: res.meta };
      } catch (error) {
        setSurvey(null);
        throw error;
      }
    },
    [surveyId]
  );

  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    data: rows,
    meta,
    isLoading: loading,
    reload,
  } = usePaginatedList<SurveyResultRow>({
    fetchPage,
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Failed to load results"),
  });

  const questions = survey?.questions ?? [];

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: survey?.name ? `${survey.name} · Results` : "Survey Results",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      { label: survey?.name ?? "Results" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, survey?.name]);

  const enrichedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        answers: enrichRowAnswers(row, questions),
      })),
    [rows, questions]
  );

  const questionColumns = useMemo(() => {
    const cols: { id: string; question: string }[] = questions.map((q) => ({
      id: q.id,
      question: q.question || q.id,
    }));
    const known = new Set(cols.map((c) => c.id));
    for (const row of enrichedRows) {
      for (const answer of row.answers) {
        if (!known.has(answer.questionId)) {
          known.add(answer.questionId);
          cols.push({
            id: answer.questionId,
            question: answer.question || answer.questionId,
          });
        }
      }
    }
    return cols;
  }, [questions, enrichedRows]);

  const handleExport = async (format: SurveyResultsExportFormat) => {
    if (exporting) return;
    setExporting(true);
    try {
      // API: exportSurveyResults() → GET /api/surveys/:id/results/export
      const { blob, filename } = await exportSurveyResults(
        surveyId,
        {
          format,
          search: debouncedSearch || undefined,
        }
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(
        format === "csv" ? "CSV downloaded" : "Excel sheet downloaded"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export results"
      );
    } finally {
      setExporting(false);
    }
  };

  const status = (survey?.scheduling_status ?? "completed") as SurveyDisplayStatus;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--brand)_8%,transparent),transparent_45%)]"
      />

      <PageContainer size="full" className="relative">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-1 size-9 shrink-0 rounded-[8px] bg-card/80"
                onClick={() => router.push("/survey")}
                aria-label="Back to surveys"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Survey results
                  </h1>
                  {survey?.scheduling_status ? (
                    <SurveyStatusBadge status={status} />
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  {survey?.name ?? "Survey"}
                  {meta.total > 0
                    ? ` · ${meta.total} response${meta.total === 1 ? "" : "s"}`
                    : null}
                </p>
              </div>
            </div>

            <ListToolbar
              className="w-full border-border/40 bg-card/90 p-2 sm:max-w-md lg:ml-auto lg:w-auto lg:max-w-none sm:p-2.5"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search phone, session, or call sid…"
              searchAriaLabel="Search responses"
              actions={
                canExportSurvey ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 shrink-0 rounded-[6px] gap-1.5 border-primary/20 bg-card hover:border-primary/40"
                        disabled={exporting || meta.total === 0}
                      >
                        {exporting ? (
                          <AppLoaderSpinner size="sm" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        disabled={exporting}
                        onClick={() => void handleExport("xlsx")}
                        className="gap-2"
                      >
                        <FileSpreadsheet className="size-4 text-primary" />
                        Excel (.xlsx)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={exporting}
                        onClick={() => void handleExport("csv")}
                        className="gap-2"
                      >
                        <FileText className="size-4 text-primary" />
                        CSV (.csv)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null
              }
            />
          </div>

          {!error && meta.total > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Responses"
                value={meta.total}
                icon={Users}
                glowClass="bg-primary/25"
              />
              <StatCard
                label="Questions"
                value={questions.length || "—"}
                icon={HelpCircle}
                glowClass="bg-sky-400/25"
              />
              <StatCard
                label="On this page"
                value={enrichedRows.length}
                icon={MessageSquareText}
                glowClass="bg-emerald-400/25"
              />
            </div>
          ) : null}

          {loading ? (
            <SurveyFetchLoader label="Loading results" />
          ) : error ? (
            <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : enrichedRows.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border/60 bg-card/80 px-6 py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-7 text-primary" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">
                No responses found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch
                  ? "Try a different phone or session id."
                  : "Results will appear after calls complete."}
              </p>
            </div>
          ) : (
            <ResultsInlineQaTable
              rows={enrichedRows}
              questionColumns={questionColumns}
            />
          )}

          {!error && meta.total > 0 ? (
            <DataPagination
              meta={meta}
              onPageChange={setPage}
              itemLabel="responses"
            />
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}

interface SurveyResultDetailViewProps {
  surveyId: string;
  resultId: string;
}

function ResponseQaTable({
  answers,
  rowRecording,
  recordingDurationSeconds,
  callMeta,
  embedded = false,
  layout = "classic",
}: {
  answers: SurveyResultAnswer[];
  rowRecording?: string | null;
  recordingDurationSeconds?: number | null;
  callMeta?: SurveyResultRow | null;
  /** When true, omit outer card chrome (used inside modal) */
  embedded?: boolean;
  /** detail = card list for wide modal; classic = 2-col table */
  layout?: "classic" | "detail";
}) {
  const [questionPopup, setQuestionPopup] = useState<{
    number: number;
    question: string;
  } | null>(null);

  const metaRows: { question: string; response: string }[] = [];

  if (layout === "classic") {
    if (callMeta?.call?.call_status) {
      metaRows.push({
        question: "Status",
        response: callMeta.call.call_status,
      });
    }
    if (callMeta?.call?.billsec || callMeta?.call?.duration) {
      metaRows.push({
        question: "Duration (sec)",
        response: callMeta.call.billsec || callMeta.call.duration || "---",
      });
    }

    for (const field of getCallDisplayFields(callMeta?.call)) {
      let value = field.value;
      if (field.key === "call_connected") {
        value = value === "1" ? "Yes" : value === "0" ? "No" : value;
      }
      if (!value) continue;
      metaRows.push({ question: field.label, response: value });
    }
  }

  const detailBody = (
    <div className="space-y-2.5">
      {answers.length ? (
        answers.map((answer, index) => {
          const recordingUrl = resolveAnswerRecordingUrl(answer, null);
          return (
            <div
              key={answer.questionId}
              className="overflow-hidden rounded-[8px] border border-border/50 bg-card shadow-sm transition-colors hover:border-primary/25"
            >
              <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <TruncatedQuestionCell
                    number={index + 1}
                    question={answer.question}
                    onNumberClick={() =>
                      setQuestionPopup({
                        number: index + 1,
                        question: answer.question,
                      })
                    }
                  />
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:pl-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Answer
                  </span>
                  <span className="inline-flex max-w-full rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {answer.answer?.trim() ? answer.answer : "---"}
                  </span>
                  {recordingUrl ? (
                    <InlineRecordingPlayer
                      src={recordingUrl}
                      durationSeconds={recordingDurationSeconds}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="rounded-[8px] border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          No answers recorded.
        </p>
      )}
    </div>
  );

  const classicTable = (
    <div className={embedded ? "max-h-none" : "max-h-[70vh] overflow-y-auto"}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted/40">
            <th className="w-[55%] border-b border-border/50 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Question
            </th>
            <th className="w-[45%] border-b border-border/50 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Response
            </th>
          </tr>
        </thead>
        <tbody>
          {metaRows.map((row) => (
            <tr
              key={`meta-${row.question}`}
              className="border-b border-border/30 odd:bg-background even:bg-muted/20"
            >
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                {row.question}
              </td>
              <td className="break-all px-4 py-3 text-sm text-foreground">
                {row.response || "---"}
              </td>
            </tr>
          ))}

          {answers.length ? (
            answers.map((answer, index) => {
              const recordingUrl = resolveAnswerRecordingUrl(answer, null);
              return (
                <tr
                  key={answer.questionId}
                  className="border-b border-border/30 odd:bg-background even:bg-muted/20"
                >
                  <td className="align-middle px-4 py-3">
                    <TruncatedQuestionCell
                      number={index + 1}
                      question={answer.question}
                      onNumberClick={() =>
                        setQuestionPopup({
                          number: index + 1,
                          question: answer.question,
                        })
                      }
                    />
                  </td>
                  <td className="align-middle px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {answer.answer?.trim() ? answer.answer : "---"}
                      </span>
                      {recordingUrl ? (
                        <InlineRecordingPlayer
                          src={recordingUrl}
                          durationSeconds={recordingDurationSeconds}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : !metaRows.length ? (
            <tr>
              <td
                colSpan={2}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No answers recorded.
              </td>
            </tr>
          ) : null}

          {rowRecording ? (
            <tr className="border-b border-border/30 bg-muted/20">
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                Recording
              </td>
              <td className="px-4 py-3">
                <InlineRecordingPlayer
                  src={rowRecording}
                  durationSeconds={recordingDurationSeconds}
                />
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );

  const body = layout === "detail" ? detailBody : classicTable;

  return (
    <>
      {embedded || layout === "detail" ? (
        body
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-border/60 bg-card shadow-sm">
          {body}
        </div>
      )}

      <QuestionNumberPopup
        open={Boolean(questionPopup)}
        onClose={() => setQuestionPopup(null)}
        number={questionPopup?.number ?? 0}
        question={questionPopup?.question ?? ""}
      />
    </>
  );
}

export function SurveyResponseDetailView({
  surveyId,
  resultId,
}: SurveyResultDetailViewProps) {
  const router = useRouter();
  const [result, setResult] = useState<SurveyResultRow | null>(null);
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questions = survey?.questions ?? [];

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: survey?.name
      ? `${survey.name} · Response`
      : "Response details",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      {
        label: survey?.name ?? "Results",
        href: `/survey/${surveyId}/results`,
      },
      { label: "Details" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, survey?.name]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API: getSurveyResult() → GET /api/surveys/:id/results/:resultId
      const res = await getSurveyResult(surveyId, resultId);
      setResult(res.result);
      setSurvey(res.survey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load response");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [surveyId, resultId]);

  useEffect(() => {
    void load();
  }, [load]);

  const answers = useMemo(() => {
    if (!result) return [];
    return enrichRowAnswers(result, questions);
  }, [result, questions]);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_16%,transparent),transparent_55%)]"
      />

      <PageContainer size="full" className="relative">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-1 size-9 shrink-0 rounded-[6px] bg-card/80"
              onClick={() => router.push(`/survey/${surveyId}/results`)}
              aria-label="Back to results"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Response details
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {survey?.name ?? "Survey"}
                {result?.customer_number
                  ? ` · ${result.customer_number}`
                  : null}
              </p>
            </div>
          </div>

          {loading ? (
            <SurveyFetchLoader label="Loading response" />
          ) : error ? (
            <div className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[6px] border border-border/50 bg-card shadow-sm"
            >
              <header className="border-b border-border/40 bg-linear-to-br from-primary/12 via-background to-brand-soft/40 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
                    <Phone className="size-3.5 text-primary" />
                    {result.customer_number || "—"}
                  </span>
                  {result.extracted_at ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                      <CalendarClock className="size-3.5" />
                      {formatSurveyCreatedAt(result.extracted_at)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    <MessageCircle className="size-3.5" />
                    {answers.length} answers
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {result.customer_name || "Unknown contact"}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Session
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-foreground">
                      {result.session_id || "—"}
                    </p>
                  </div>
                </div>
              </header>

              <div className="px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Questions &amp; answers
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {answers.length} recorded
                  </span>
                </div>

                <ResponseQaTable
                  answers={answers}
                  rowRecording={result.recording_url}
                  recordingDurationSeconds={
                    result.recording_duration_seconds ?? null
                  }
                  callMeta={result}
                />
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AppLoaderSpinner size="sm" />
              Loading…
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
