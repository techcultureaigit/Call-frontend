import type { ResponseStatus } from "@/types/response";

export const RESPONSE_STATUS_OPTIONS: {
  label: string;
  value: ResponseStatus;
}[] = [
  { label: "Completed", value: "completed" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Flagged", value: "flagged" },
  { label: "Rejected", value: "rejected" },
  { label: "Partial", value: "partial" },
];

export const SENTIMENT_OPTIONS = [
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
] as const;
