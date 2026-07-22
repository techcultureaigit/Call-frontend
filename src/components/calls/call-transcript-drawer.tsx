"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { formatCallDuration } from "@/lib/constants/calls";
import { formatDateTime } from "@/lib/utils";
import { CallStatusBadge } from "./call-status-badge";
import { CallCustomerDetails } from "./call-customer-details";
import { RecordingPlayer } from "./recording-player";
import { CallTimeline } from "./call-timeline";
import type { Call } from "@/types/call";

interface CallTranscriptDrawerProps {
  call: Call | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: (id: string) => void;
  isRetrying?: boolean;
}

export function CallTranscriptDrawer({
  call,
  open,
  onOpenChange,
  onRetry,
  isRetrying,
}: CallTranscriptDrawerProps) {
  if (!call) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CallStatusBadge
              status={call.status}
              pulse={["in_progress", "queued"].includes(call.status)}
            />
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
              {call.direction}
            </span>
            {call.retryCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Retry #{call.retryCount}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {call.customer.firstName} {call.customer.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {call.campaignName ?? "Direct call"} · {call.agentName}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{formatDateTime(call.startedAt)}</span>
            <span>{formatCallDuration(call.durationSeconds)}</span>
          </div>
        </div>
      </SheetHeader>

      <SheetContent className="space-y-6">
        <CallCustomerDetails customer={call.customer} />

        {call.recordingUrl && call.recordingDurationSeconds && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recording
            </h3>
            <RecordingPlayer durationSeconds={call.recordingDurationSeconds} />
          </div>
        )}

        {call.transcript && call.transcript.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transcript
            </h3>
            <div className="space-y-3 rounded-[6px] border border-border/60 bg-card p-4">
              {call.transcript.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.speaker === "agent"
                      ? "border-l-2 border-primary/40 pl-3"
                      : "border-l-2 border-muted-foreground/30 pl-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {line.speaker === "agent" ? call.agentName : call.customer.firstName}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/60">
                      {formatCallDuration(line.offsetSeconds)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </h3>
          <CallTimeline events={call.timeline} />
        </div>

        {call.notes && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </h3>
            <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
              {call.notes}
            </p>
          </div>
        )}
      </SheetContent>

      {call.canRetry && (
        <SheetFooter>
          <Button
            onClick={() => onRetry(call.id)}
            disabled={isRetrying}
            className="w-full gap-2"
          >
            <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Scheduling retry…" : "Retry Call"}
          </Button>
        </SheetFooter>
      )}
    </Sheet>
  );
}
