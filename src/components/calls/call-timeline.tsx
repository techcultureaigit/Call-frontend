"use client";

import {
  CheckCircle2,
  Phone,
  PhoneCall,
  RefreshCw,
  Voicemail,
  XCircle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { CallTimelineEvent, CallTimelineEventType } from "@/types/call";

const eventIcons: Record<CallTimelineEventType, typeof Phone> = {
  initiated: Phone,
  ringing: PhoneCall,
  answered: PhoneCall,
  recording_started: Voicemail,
  completed: CheckCircle2,
  failed: XCircle,
  retry_scheduled: RefreshCw,
  transferred: Phone,
};

const eventColors: Record<CallTimelineEventType, string> = {
  initiated: "bg-muted text-muted-foreground",
  ringing: "bg-blue-500/10 text-blue-600",
  answered: "bg-emerald-500/10 text-emerald-600",
  recording_started: "bg-violet-500/10 text-violet-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
  retry_scheduled: "bg-amber-500/10 text-amber-600",
  transferred: "bg-sky-500/10 text-sky-600",
};

interface CallTimelineProps {
  events: CallTimelineEvent[];
}

export function CallTimeline({ events }: CallTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const Icon = eventIcons[event.type] ?? Phone;
        const isLast = i === sorted.length - 1;

        return (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-border/60" />
            )}
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                eventColors[event.type]
              )}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium">{event.label}</p>
              {event.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.description}
                </p>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">
                {formatRelativeTime(event.occurredAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
