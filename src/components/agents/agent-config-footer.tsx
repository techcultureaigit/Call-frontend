"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentConfigFooterProps {
  onBack: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
}

export function AgentConfigFooter({
  onBack,
  onNext,
  isFirst,
  isLast,
  isSaving,
}: AgentConfigFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border/40 pt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isFirst}
        className="rounded-xl"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <Button onClick={onNext} disabled={isSaving} className="rounded-xl">
        {isLast ? "Save" : "Save & Next"}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
