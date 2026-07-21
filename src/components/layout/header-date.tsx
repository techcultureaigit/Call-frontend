"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function formatHeaderDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface HeaderDateProps {
  className?: string;
}

export function HeaderDate({ className }: HeaderDateProps) {
  const [label, setLabel] = useState(() => formatHeaderDate(new Date()));

  useEffect(() => {
    const tick = () => setLabel(formatHeaderDate(new Date()));
    tick();

    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-[6px] border border-border/60 bg-muted/40 px-2.5 py-1.5",
        "text-[11px] font-medium tabular-nums text-muted-foreground sm:flex",
        className
      )}
      aria-label={`Today is ${label}`}
    >
      {/* <CalendarDays className="size-3.5 shrink-0 text-brand" /> */}
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
