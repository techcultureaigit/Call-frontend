/** Analytics visual tokens — navy CRM theme, not a separate purple palette. */

export type AnalyticsTone = {
  fill: string;
  text: string;
  soft: string;
  border: string;
  sparkStroke: string;
  sparkFill: string;
  iconBg: string;
};

export const TONE = {
  navy: {
    fill: "#2c3b59",
    text: "text-[#2c3b59]",
    soft: "bg-[#2c3b59]/8",
    border: "border-[#2c3b59]/15",
    sparkStroke: "stroke-[#2c3b59]",
    sparkFill: "fill-[#2c3b59]/15",
    iconBg: "bg-[#2c3b59]/10 text-[#2c3b59]",
  },
  blue: {
    fill: "#60a5fa",
    text: "text-[#3b82f6]",
    soft: "bg-[#60a5fa]/12",
    border: "border-[#60a5fa]/25",
    sparkStroke: "stroke-[#60a5fa]",
    sparkFill: "fill-[#60a5fa]/15",
    iconBg: "bg-[#60a5fa]/15 text-[#3b82f6]",
  },
  green: {
    fill: "#34d399",
    text: "text-emerald-700",
    soft: "bg-emerald-400/15",
    border: "border-emerald-400/25",
    sparkStroke: "stroke-emerald-400",
    sparkFill: "fill-emerald-400/15",
    iconBg: "bg-emerald-400/15 text-emerald-700",
  },
  red: {
    fill: "#f87171",
    text: "text-[#dc2626]",
    soft: "bg-[#f87171]/12",
    border: "border-[#f87171]/25",
    sparkStroke: "stroke-[#f87171]",
    sparkFill: "fill-[#f87171]/15",
    iconBg: "bg-[#f87171]/15 text-[#dc2626]",
  },
  amber: {
    fill: "#fbbf24",
    text: "text-amber-700",
    soft: "bg-amber-300/20",
    border: "border-amber-300/30",
    sparkStroke: "stroke-amber-400",
    sparkFill: "fill-amber-300/25",
    iconBg: "bg-amber-300/20 text-amber-700",
  },
  slate: {
    fill: "#94a3b8",
    text: "text-[#6b778c]",
    soft: "bg-[#94a3b8]/12",
    border: "border-[#94a3b8]/25",
    sparkStroke: "stroke-[#94a3b8]",
    sparkFill: "fill-[#94a3b8]/15",
    iconBg: "bg-[#94a3b8]/15 text-[#6b778c]",
  },
} as const satisfies Record<string, AnalyticsTone>;

export const KPI_TONE: Record<string, AnalyticsTone> = {
  total_calls: TONE.navy,
  connected: TONE.green,
  avg_duration: TONE.blue,
  missed: TONE.red,
  survey_complete: TONE.blue,
  survey_partial: TONE.amber,
  survey_incomplete: TONE.slate,
};

export const SURVEY_SLICE_TONE: Record<string, AnalyticsTone> = {
  Complete: TONE.blue,
  "Partially complete": TONE.amber,
  Incomplete: TONE.slate,
  Missed: TONE.red,
};

export const REASON_SLICE_TONE: Record<string, AnalyticsTone> = {
  "Disconnected by caller": TONE.red,
  "Disconnected by agent": TONE.blue,
  Unknown: TONE.slate,
};

/** One-line meaning — Missed ≠ Incomplete. */
export const STATUS_HINT: Record<string, string> = {
  Complete: "Picked up and finished every required question",
  "Partially complete": "Picked up and answered some questions, not all",
  Incomplete: "Picked up the call, but gave no answers",
  Missed: "Did not pick up the call",
  Connected: "Call was answered",
  "Disconnected by caller": "Caller hung up the call",
  "Disconnected by agent": "Agent or system ended the call",
  Unknown: "No disconnect reason was recorded",
};

export const STATUS_HINT_SHORT: Record<string, string> = {
  Complete: "Finished all questions",
  "Partially complete": "Some answers, not finished",
  Incomplete: "Picked up, no answers",
  Missed: "Did not pick up",
  Connected: "Phone was answered",
  "Disconnected by caller": "Caller hung up",
  "Disconnected by agent": "Agent ended the call",
  Unknown: "Reason not recorded",
};

export const KPI_HINT: Record<string, string> = {
  total_calls: "Every call attempted for this survey",
  connected: "Phone was answered",
  avg_duration: "Average talk time on connected calls",
  missed: "Did not pick up the call",
  survey_complete: "Picked up and finished the survey",
  survey_partial: "Picked up, answered some questions",
  survey_incomplete: "Picked up, but gave no answers",
};

/** Decorative spark from a 0–100 share — not a time series. */
export function sparkFromShare(sharePct: number): number[] {
  const peak = Math.max(10, Math.min(100, sharePct || 8));
  const wave = [0.22, 0.4, 0.58, 0.86, 1, 0.74, 0.5, 0.64];
  return wave.map((n) => Math.round(n * peak));
}
