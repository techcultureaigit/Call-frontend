"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentConfigFooterProps {
  onBack: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  step?: number;
  total?: number;
}

export function AgentConfigFooter({
  onBack,
  onNext,
  isFirst,
  isLast,
  isSaving,
  step = 1,
  total = 5,
}: AgentConfigFooterProps) {
  const pct = Math.round((step / total) * 100);

  return (
    <div className="mt-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="tabular-nums">
            Step <span className="text-foreground">{step}</span> of {total}
          </span>
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} disabled={isFirst}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isSaving} className="min-w-[140px]">
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isLast ? (
            <>
              <Check className="size-4" />
              Save agent
            </>
          ) : (
            <>
              Save &amp; Next
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
