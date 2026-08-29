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
 *   getSurveyResultTranscriptions() → GET /api/surveys/:id/results/:resultId/transcriptions
 */

import {
  listSurveyResults,
  exportSurveyResults,
  getSurveyResult,
  getSurveyResultTranscriptions,
} from "./api";
import type {
  SurveyResultsExportFormat,
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultRow,
  SurveyResultTranscription,
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
  TableReadMore,
  TABLE_ROW_ACCENT_CLASS,
} from "@/components/shared/data-table";
import {
  TableColumnsBar,
  TableColumnDnd,
  SortableColumnTh,
  applyColumnLayout,
  resolveColumnPin,
  useTableColumnLayout,
  TABLE_HEAD_ROW_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_BODY_CELL_CLASS,
} from "@/components/shared/table-column-layout";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
import { ArrowLeft, Bot, CalendarClock, Clock3, Download, Eye, FileSpreadsheet, FileText, HelpCircle, MessageSquareText, Phone, Sparkles, UserRound, Users, MessageCircle, Pause, Play, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";

/** Round speech bubble — classic “chat” look (WhatsApp / Messenger style) */
function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M12 2.5c-5.1 0-9.25 3.72-9.25 8.3 0 2.72 1.48 5.14 3.8 6.72v3.28a.75.75 0 0 0 1.2.6l3.55-2.48c.23.02.46.03.7.03 5.1 0 9.25-3.72 9.25-8.15S17.1 2.5 12 2.5Zm-3.35 7.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm3.35 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm3.35 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
    </svg>
  );
}

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

/** Call fields shown in the results table (exact API names). */
const CALL_EXACT_FIELDS = [
  "start_stamp",
  "answer_stamp",
  "end_stamp",
  "caller_id_number",
  "hangup_cause_description",
  "reason_key",
] as const;

const CALL_FIELD_LABELS: Record<string, string> = {
  start_stamp: "Start stamp",
  answer_stamp: "Answer stamp",
  end_stamp: "End stamp",
  caller_id_number: "Caller ID number",
  hangup_cause_description: "Hangup cause description",
  reason_key: "Reason key",
};

function getCallFieldValue(
  call: SurveyResultRow["call"],
  key: string
): string {
  if (!call) return "";
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
    return { key, label: CALL_FIELD_LABELS[key] || key, value };
  }).filter((f) => f.value);
}

function resolveRowStatus(row: SurveyResultRow | null | undefined): string {
  const status = row?.status?.trim();
  return status || "missed";
}

function formatDurationLabel(value?: string) {
  const raw = String(value || "").trim();
  if (!raw) return "---";
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}s`;
  return raw;
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

function DownloadRecordingButton({ src }: { src: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("Failed to fetch recording");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const ext = blob.type.includes("mpeg") || blob.type.includes("mp3") ? "mp3" : "wav";
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      window.open(src, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      aria-label="Download recording"
    >
      {downloading ? (
        <AppLoaderSpinner size="sm" />
      ) : (
        <Download className="size-3.5" />
      )}
    </button>
  );
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
      <DownloadRecordingButton src={src} />
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

/** Message-icon popup — chat transcription only (dedicated API) */
function TranscriptionChatModal({
  open,
  onOpenChange,
  surveyId,
  row,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  row: SurveyResultRow | null;
}) {
  const [customerNumber, setCustomerNumber] = useState("");
  const [transcriptions, setTranscriptions] = useState<
    SurveyResultTranscription[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !row?.id || !surveyId) {
      setCustomerNumber("");
      setTranscriptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    const resultId = row.id;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTranscriptions([]);
    setCustomerNumber(row.customer_number || "");

    void (async () => {
      try {
        const res = await getSurveyResultTranscriptions(surveyId, resultId);
        if (cancelled) return;
        setCustomerNumber(res.customer_number || row.customer_number || "");
        setTranscriptions(res.transcriptions ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load transcription"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, surveyId, row]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,620px)] max-w-none flex-col gap-0 overflow-hidden border border-border/60 bg-card p-0 shadow-elevated sm:rounded-[8px]">
        <div className="relative shrink-0 overflow-hidden border-b border-border/50">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_55%)]"
          />
          <DialogHeader className="relative px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/15">
                    <ChatBubbleIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-lg font-semibold tracking-tight text-foreground">
                      Call conversation
                    </DialogTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Agent &amp; customer chat replay
                    </p>
                  </div>
                </div>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/50">
                      <Phone className="size-3.5 text-primary" />
                      {customerNumber || "—"}
                    </span>
                    {transcriptions.length ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
                        <ChatBubbleIcon className="size-3" />
                        {transcriptions.length} messages
                      </span>
                    ) : null}
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/20">
          <div className="min-h-0 max-h-[calc(92vh-7.5rem)] flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <SurveyFetchLoader label="Loading conversation" />
              </div>
            ) : (
              <>
                {error ? (
                  <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {error}
                  </div>
                ) : null}
                <TranscriptionChat transcriptions={transcriptions} fillHeight />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Eye-icon popup — recording, call overview, Q&A (no chat) */
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
  const durationSeconds = row?.recording_duration_seconds ?? null;
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

    push("Duration", call.duration, Clock3);
    push("Start stamp", call.start_stamp, CalendarClock);
    push("Answer stamp", call.answer_stamp, CalendarClock);
    push("End stamp", call.end_stamp, CalendarClock);
    push("Caller ID number", call.caller_id_number, Phone);
    push("Hangup cause description", call.hangup_cause_description);
    push("Reason key", call.reason_key);
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
                    <CallStatusPill status={resolveRowStatus(row)} />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatTranscriptionTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function TranscriptionChat({
  transcriptions,
  fillHeight = false,
}: {
  transcriptions: SurveyResultTranscription[];
  fillHeight?: boolean;
}) {
  if (!transcriptions.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/80 px-4 py-16 text-center shadow-subtle">
        <span className="mb-4 flex size-12 items-center justify-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/15">
          <ChatBubbleIcon className="size-5" />
        </span>
        <p className="text-sm font-semibold text-foreground">
          No conversation yet
        </p>
        <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          Agent and customer chat turns will appear here once this call is transcribed.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-border/50 bg-card/60 px-3 py-4 sm:px-4",
        fillHeight
          ? "min-h-0"
          : "max-h-[min(52vh,420px)] overflow-y-auto"
      )}
    >
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border/50">
          <ChatBubbleIcon className="size-3 text-brand" />
          {transcriptions.length} messages in this call
        </span>
      </div>

      <div className="flex flex-col">
        {transcriptions.map((turn, index) => {
          const isCustomer = turn.speaker === "CUSTOMER";
          const prev = transcriptions[index - 1];
          const next = transcriptions[index + 1];
          const isFirstInGroup = prev?.speaker !== turn.speaker;
          const isLastInGroup = next?.speaker !== turn.speaker;
          const time = formatTranscriptionTime(turn.timestamp);

          return (
            <motion.div
              key={`${turn.speaker}-${turn.timestamp ?? index}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.28) }}
              className={cn(
                "flex w-full gap-2.5",
                isCustomer ? "flex-row-reverse" : "flex-row",
                isFirstInGroup && index > 0 ? "mt-4" : "mt-1"
              )}
            >
              {isLastInGroup ? (
                <div
                  className={cn(
                    "mt-auto mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-md shadow-sm ring-1 ring-border/40",
                    isCustomer
                      ? "bg-brand-blue text-white"
                      : "bg-brand text-brand-foreground"
                  )}
                  aria-hidden
                >
                  {isCustomer ? (
                    <UserRound className="size-3.5" />
                  ) : (
                    <Bot className="size-3.5" />
                  )}
                </div>
              ) : (
                <div className="size-8 shrink-0" aria-hidden />
              )}

              <div
                className={cn(
                  "flex min-w-0 max-w-[min(100%,26rem)] flex-1 flex-col",
                  isCustomer ? "items-end" : "items-start"
                )}
              >
                {isFirstInGroup ? (
                  <div
                    className={cn(
                      "mb-1 flex items-center gap-1.5 px-0.5",
                      isCustomer ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        isCustomer
                          ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
                          : "bg-brand/10 text-brand ring-1 ring-brand/20"
                      )}
                    >
                      {isCustomer ? "Customer" : "Agent"}
                    </span>
                    {time ? (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {time}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div
                  className={cn(
                    "relative px-3.5 py-2.5 text-sm leading-relaxed",
                    isCustomer
                      ? "rounded-md rounded-br-sm bg-brand text-brand-foreground shadow-brand"
                      : "rounded-md rounded-bl-sm bg-card text-foreground shadow-subtle ring-1 ring-border/70"
                  )}
                >
                  <p className="font-hindi whitespace-pre-wrap break-words">{turn.text_content}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 px-2">
        <span className="h-px flex-1 bg-border/70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          End of transcript
        </span>
        <span className="h-px flex-1 bg-border/70" />
      </div>
    </div>
  );
}

function CallStatusPill({ status }: { status?: string }) {
  const resolved = status?.trim() || "missed";
  const normalized = resolved.toLowerCase();
  const completed = normalized === "completed";
  const missed = normalized === "missed";
  const partial =
    normalized === "partially completed" || normalized === "partially_completed";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        completed &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
        missed && "border-rose-500/25 bg-rose-500/10 text-rose-700",
        partial && "border-amber-500/25 bg-amber-500/10 text-amber-700",
        !completed &&
          !missed &&
          !partial &&
          "border-border/60 bg-muted/50 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          completed && "bg-emerald-500",
          missed && "bg-rose-500",
          partial && "bg-amber-500",
          !completed && !missed && !partial && "bg-muted-foreground/50"
        )}
      />
      {resolved}
    </span>
  );
}

/** Results table — same shell/pattern as My Surveys DataTable */
function ResultsInlineQaTable({
  rows,
  questionColumns,
  layoutKey,
  surveyId,
}: {
  rows: SurveyResultRow[];
  questionColumns: { id: string; question: string }[];
  layoutKey: string;
  surveyId: string;
}) {
  const [questionPopup, setQuestionPopup] = useState<{
    number: number;
    question: string;
  } | null>(null);
  const [detailsRow, setDetailsRow] = useState<SurveyResultRow | null>(null);
  const [chatRow, setChatRow] = useState<SurveyResultRow | null>(null);

  const callColumns = useMemo(
    () => CALL_EXACT_FIELDS.map((key) => ({ key, label: CALL_FIELD_LABELS[key] || key })),
    []
  );

  const layoutItems = useMemo(
    () => [
      {
        id: "actions",
        label: "Action",
        hideable: false as const,
        pin: "start" as const,
      },
      { id: "phone", label: "Phone" },
      { id: "date", label: "Date" },
      { id: "status", label: "Status" },
      { id: "duration", label: "Duration" },
      ...callColumns.map((col) => ({
        id: `call:${col.key}`,
        label: CALL_FIELD_LABELS[col.key] || col.label,
      })),
      ...questionColumns.map((col, index) => ({
        id: `q:${col.id}`,
        label: `Q${index + 1}`,
      })),
      { id: "audio", label: "Audio" },
    ],
    [callColumns, questionColumns]
  );

  const {
    layout,
    pickerItems,
    hidden,
    toggleHidden,
    reorder,
    reset,
    lockedIds,
  } = useTableColumnLayout(layoutKey, layoutItems);

  const visibleItems = useMemo(
    () =>
      applyColumnLayout(
        layoutItems,
        layout,
        (item) => item.id,
        (item) => resolveColumnPin(item, layoutItems[0]?.id)
      ),
    [layoutItems, layout]
  );

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        <div className="shrink-0">
          <TableColumnsBar
            items={pickerItems}
            hidden={hidden}
            onToggle={toggleHidden}
            onReorder={reorder}
            onReset={reset}
          />
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
          <TableColumnDnd
            ids={visibleItems.map((col) => col.id)}
            lockedIds={lockedIds}
            onReorder={reorder}
          >
          <table className={cn("w-full border-collapse", "min-w-[720px]")}>
            <thead>
                <tr className={cn(TABLE_HEAD_ROW_CLASS, "[&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:bg-card")}>
                  {visibleItems.map((col) => {
                    if (col.id === "actions") {
                      return (
                        <SortableColumnTh
                          key={col.id}
                          id={col.id}
                          className="sticky left-0 z-30 min-w-28 bg-card shadow-[2px_0_6px_-2px_rgba(15,23,42,0.12)]"
                        >
                          Action
                        </SortableColumnTh>
                      );
                    }
                    if (col.id.startsWith("q:")) {
                      const qid = col.id.slice(2);
                      const qIndex = questionColumns.findIndex(
                        (q) => q.id === qid
                      );
                      const question = questionColumns[qIndex];
                      if (!question) return null;
                      const number = qIndex + 1;
                      const needsTruncate = question.question.length > 28;
                      const label = needsTruncate
                        ? `${question.question.slice(0, 28).trimEnd()}…`
                        : question.question;
                      return (
                        <SortableColumnTh
                          key={col.id}
                          id={col.id}
                          className="min-w-[8rem] max-w-[12rem] text-center"
                        >
                          <div className="flex max-w-[11rem] items-center justify-center gap-1.5 normal-case tracking-normal">
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionPopup({
                                  number,
                                  question: question.question,
                                })
                              }
                              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[10px] font-bold tabular-nums text-primary hover:bg-primary/15"
                              title="View full question"
                              aria-label={`View question ${number}`}
                            >
                              {number}
                            </button>
                            <span
                              className="min-w-0 truncate text-[10px] font-medium text-foreground/80"
                              title={question.question}
                            >
                              {label}
                            </span>
                            {needsTruncate ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setQuestionPopup({
                                    number,
                                    question: question.question,
                                  })
                                }
                                className="shrink-0 text-[10px] font-semibold text-primary hover:underline"
                              >
                                More
                              </button>
                            ) : null}
                          </div>
                        </SortableColumnTh>
                      );
                    }
                    return (
                      <SortableColumnTh
                        key={col.id}
                        id={col.id}
                        className={cn(col.id === "audio" && "text-center")}
                      >
                        {col.label}
                      </SortableColumnTh>
                    );
                  })}
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
                    className={TABLE_BODY_ROW_CLASS}
                  >
                    {visibleItems.map((col) => {
                      if (col.id === "actions") {
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              "relative sticky left-0 z-10 min-w-28 bg-card shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)]"
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full opacity-80 transition-opacity group-hover:opacity-100",
                                TABLE_ROW_ACCENT_CLASS
                              )}
                            />
                            <div className="flex items-center gap-1.5">
                              <DataTableActionButton
                                label="View response details"
                                onClick={() => setDetailsRow(row)}
                              >
                                <Eye className="size-3.5" />
                              </DataTableActionButton>
                              <button
                                type="button"
                                onClick={() => setChatRow(row)}
                                className={cn(
                                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-all",
                                  "hover:scale-105 active:scale-95",
                                  row.has_transcription
                                    ? "bg-brand text-white shadow-[0_6px_14px_-8px_#2983ad] hover:bg-[#247399]"
                                    : "bg-brand/15 text-brand ring-1 ring-brand/25 hover:bg-brand/25"
                                )}
                                aria-label={
                                  row.has_transcription
                                    ? "View call conversation"
                                    : "Open call conversation"
                                }
                                title={
                                  row.has_transcription
                                    ? "View call conversation"
                                    : "Open conversation (no transcript yet)"
                                }
                              >
                                <ChatBubbleIcon className="size-[15px]" />
                              </button>
                            </div>
                          </td>
                        );
                      }
                      if (col.id === "phone") {
                        return (
                          <td
                            key={col.id}
                            className="whitespace-nowrap px-4 py-3.5 align-middle"
                          >
                            <DataTableMetaChip
                              icon={Phone}
                              label={row.customer_number || "—"}
                              tabular
                              className="max-w-none font-semibold text-foreground"
                            />
                          </td>
                        );
                      }
                      if (col.id === "date") {
                        return (
                          <td
                            key={col.id}
                            className="whitespace-nowrap px-4 py-3.5 align-middle"
                          >
                            <DataTableMetaChip
                              icon={CalendarClock}
                              label={
                                row.extracted_at
                                  ? formatSurveyCreatedAt(row.extracted_at)
                                  : "—"
                              }
                            />
                          </td>
                        );
                      }
                      if (col.id === "status") {
                        return (
                          <td
                            key={col.id}
                            className="whitespace-nowrap px-4 py-3.5 align-middle"
                          >
                            <CallStatusPill status={resolveRowStatus(row)} />
                          </td>
                        );
                      }
                      if (col.id === "duration") {
                        return (
                          <td
                            key={col.id}
                            className="whitespace-nowrap px-4 py-3.5 align-middle"
                          >
                            <DataTableMetaChip
                              icon={Clock3}
                              label={formatDurationLabel(row.call?.duration)}
                              tabular
                            />
                          </td>
                        );
                      }
                      if (col.id.startsWith("call:")) {
                        const key = col.id.slice(5);
                        const value = getCallFieldValue(row.call, key);
                        const display = value || "---";
                        return (
                          <td
                            key={col.id}
                            className={cn(TABLE_BODY_CELL_CLASS, "max-w-[14rem]")}
                          >
                            <TableReadMore text={display} />
                          </td>
                        );
                      }
                      if (col.id.startsWith("q:")) {
                        const answer = answerMap.get(col.id.slice(2));
                        const value = answer?.answer?.trim()
                          ? answer.answer
                          : "---";
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              TABLE_BODY_CELL_CLASS,
                              "max-w-[14rem] text-center"
                            )}
                          >
                            <TableReadMore text={value} className="mx-auto" />
                          </td>
                        );
                      }
                      if (col.id === "audio") {
                        return (
                          <td
                            key={col.id}
                            className="min-w-55 px-4 py-3.5 align-middle"
                          >
                            <div className="flex items-center gap-2">
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
                              <button
                                type="button"
                                onClick={() => setChatRow(row)}
                                className={cn(
                                  "inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-semibold tracking-wide transition-all",
                                  "hover:scale-[1.02] active:scale-[0.98]",
                                  row.has_transcription
                                    ? "bg-brand text-white shadow-[0_6px_14px_-8px_#2983ad] hover:bg-[#247399]"
                                    : "bg-brand/15 text-brand ring-1 ring-brand/25 hover:bg-brand/25"
                                )}
                                aria-label="View transcription"
                                title={
                                  row.has_transcription
                                    ? "View transcription"
                                    : "Open transcription (no transcript yet)"
                                }
                              >
                                Transcription
                              </button>
                            </div>
                          </td>
                        );
                      }
                      return null;
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          </TableColumnDnd>
        </div>

        <div className="shrink-0 border-t border-border/40 bg-muted/20 px-5 py-2.5">
          <p className="text-[11px] text-muted-foreground">
            Chat icon opens conversation · eye icon opens recording &amp; Q&amp;A
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

      <TranscriptionChatModal
        open={Boolean(chatRow)}
        onOpenChange={(open) => {
          if (!open) setChatRow(null);
        }}
        surveyId={surveyId}
        row={chatRow}
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

const RESULTS_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Missed", value: "missed" },
  { label: "Completed", value: "completed" },
  { label: "Partially completed", value: "partially completed" },
];

export function SurveyResponseView({ surveyId }: SurveyResultsViewProps) {
  const router = useRouter();
  const { canExportSurvey, canReadReports } = usePermissions();
  const [survey, setSurvey] = useState<SurveyResultsSurveyMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [responseStatus, setResponseStatus] = useState("all");

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
          status: responseStatus !== "all" ? responseStatus : undefined,
        });
        setSurvey(res.survey);
        return { data: res.data, meta: res.meta };
      } catch (error) {
        setSurvey(null);
        throw error;
      }
    },
    [surveyId, responseStatus]
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
    resetPageWhen: [responseStatus],
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
          status: responseStatus !== "all" ? responseStatus : undefined,
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer
        size="full"
        fullHeight
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-0.5 size-9 shrink-0 rounded-[6px] bg-card/80"
                onClick={() => router.push("/survey")}
                aria-label="Back to surveys"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={PAGE_TITLE_CLASS}>
                    Survey results
                  </h1>
                  {survey?.scheduling_status ? (
                    <SurveyStatusBadge status={status} />
                  ) : null}
                </div>
                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  {survey?.name ?? "Survey"}
                  {meta.total > 0
                    ? ` · ${meta.total} response${meta.total === 1 ? "" : "s"}`
                    : null}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {canReadReports ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-[6px] gap-1.5 border-border/50 bg-background/80 shadow-subtle hover:border-primary/30"
                  onClick={() =>
                    router.push(
                      `/analytics?surveyId=${encodeURIComponent(surveyId)}`
                    )
                  }
                >
                  <Sparkles className="size-4" />
                  Analytics
                </Button>
              ) : null}
            </div>
          </div>

          <ListToolbar
            className="shrink-0"
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search phone, session, or call sid…"
            searchAriaLabel="Search responses"
            filters={
              <Select
                value={responseStatus}
                onChange={(e) => setResponseStatus(e.target.value)}
                options={RESULTS_STATUS_OPTIONS}
                className="h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-52"
                aria-label="Filter by response status"
              />
            }
            actions={
              canExportSurvey ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 shrink-0 rounded-[6px] gap-1.5 border-border/50 bg-background/80 shadow-subtle hover:border-primary/30"
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

          {!error && meta.total > 0 ? (
            <div className="grid shrink-0 gap-3 sm:grid-cols-3">
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

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
                  {debouncedSearch || responseStatus !== "all"
                    ? "Try a different phone, session id, or status filter."
                    : "Results will appear after calls complete."}
                </p>
              </div>
            ) : (
              <ResultsInlineQaTable
                rows={enrichedRows}
                questionColumns={questionColumns}
                layoutKey={`survey-results:${surveyId}`}
                surveyId={surveyId}
              />
            )}
          </div>

          {!error && meta.total > 0 ? (
            <DataPagination
              meta={meta}
              onPageChange={setPage}
              itemLabel="responses"
              variant="inline"
              className="shrink-0"
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
    metaRows.push({
      question: "Status",
      response: resolveRowStatus(callMeta),
    });
    if (callMeta?.call?.duration) {
      metaRows.push({
        question: "Duration",
        response: formatDurationLabel(callMeta.call.duration),
      });
    }

    for (const field of getCallDisplayFields(callMeta?.call)) {
      if (!field.value) continue;
      metaRows.push({ question: field.label, response: field.value });
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
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <div className="min-w-0 space-y-6">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-0.5 size-9 shrink-0 rounded-[6px] bg-card/80"
              onClick={() => router.push(`/survey/${surveyId}/results`)}
              aria-label="Back to results"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className={PAGE_TITLE_CLASS}>
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
                  <CallStatusPill status={resolveRowStatus(result)} />
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    <MessageCircle className="size-3.5" />
                    {answers.length} answers
                  </span>
                </div>
              </header>

              <div className="space-y-5 px-5 py-4 sm:px-6">
                {result.recording_url ? (
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
                        src={result.recording_url}
                        durationSeconds={
                          result.recording_duration_seconds ?? null
                        }
                        fullWidth
                      />
                    </div>
                  </section>
                ) : null}

                <section className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Call transcription
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {result.transcriptions?.length
                        ? `${result.transcriptions.length} messages`
                        : "No transcript"}
                    </span>
                  </div>
                  <TranscriptionChat
                    transcriptions={result.transcriptions ?? []}
                  />
                </section>

                <div>
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
                    rowRecording={null}
                    recordingDurationSeconds={
                      result.recording_duration_seconds ?? null
                    }
                    callMeta={result}
                  />
                </div>
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
