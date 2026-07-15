import type { ID, Timestamps } from "./common";

export type CallStatus =
  | "completed"
  | "failed"
  | "in_progress"
  | "queued"
  | "no_answer"
  | "busy"
  | "cancelled";

export type CallDirection = "outbound" | "inbound";

export interface CallTranscriptLine {
  speaker: "agent" | "customer";
  text: string;
  offsetSeconds: number;
}

export type CallTimelineEventType =
  | "initiated"
  | "ringing"
  | "answered"
  | "recording_started"
  | "completed"
  | "failed"
  | "retry_scheduled"
  | "transferred";

export interface CallTimelineEvent {
  id: ID;
  type: CallTimelineEventType;
  label: string;
  description?: string;
  occurredAt: string;
}

export interface CallCustomerSnapshot {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export interface Call extends Timestamps {
  id: ID;
  campaignId?: ID;
  campaignName?: string;
  customer: CallCustomerSnapshot;
  agentId: ID;
  agentName: string;
  direction: CallDirection;
  status: CallStatus;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  recordingUrl?: string;
  recordingDurationSeconds?: number;
  transcript?: CallTranscriptLine[];
  timeline: CallTimelineEvent[];
  retryCount: number;
  canRetry: boolean;
  notes?: string;
}
