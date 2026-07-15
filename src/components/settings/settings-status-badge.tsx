"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function SettingsStatusBadge({
  connected,
  label,
  className,
}: {
  connected: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        connected
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-border bg-muted/60 text-muted-foreground",
        className
      )}
    >
      {connected ? (
        <>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {label ?? "Connected"}
        </>
      ) : (
        <>
          <AlertCircle className="size-3" />
          {label ?? "Disconnected"}
        </>
      )}
    </span>
  );
}

export function SettingsAutosaveIndicator({
  status,
}: {
  status: "idle" | "saving" | "saved" | "unsaved";
}) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium transition-opacity",
        status === "unsaved" && "text-amber-600",
        status === "saved" && "text-emerald-600",
        status === "saving" && "text-muted-foreground"
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" />
          Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="size-3" />
          All changes saved
        </>
      )}
      {status === "unsaved" && "Unsaved changes"}
    </span>
  );
}
