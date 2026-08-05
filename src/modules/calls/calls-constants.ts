import type { CallStatus } from "@/types/call";

export const CALL_STATUS_OPTIONS: {
  label: string;
  value: CallStatus;
}[] = [
  { label: "Completed", value: "completed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Queued", value: "queued" },
  { label: "Failed", value: "failed" },
  { label: "No Answer", value: "no_answer" },
  { label: "Busy", value: "busy" },
  { label: "Cancelled", value: "cancelled" },
];

export function formatCallDuration(seconds: number): string {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
