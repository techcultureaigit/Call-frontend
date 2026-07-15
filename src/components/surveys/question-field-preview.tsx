"use client";

import { Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SurveyQuestion } from "@/types/survey";

interface QuestionFieldPreviewProps {
  question: SurveyQuestion;
  onUpdate: (patch: Partial<SurveyQuestion>) => void;
  readOnly?: boolean;
}

export function QuestionFieldPreview({
  question,
  onUpdate,
  readOnly,
}: QuestionFieldPreviewProps) {
  const hasOptions = ["multiple_choice", "checkbox", "dropdown"].includes(
    question.type
  );

  if (question.type === "text") {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
        {question.placeholder || "Text answer..."}
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
        {question.placeholder || "0"}
      </div>
    );
  }

  if (question.type === "rating") {
    const max = question.ratingMax ?? 5;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className="size-6 text-muted-foreground/30"
            strokeWidth={1.5}
          />
        ))}
        {!readOnly && (
          <Select
            value={String(max)}
            onChange={(e) =>
              onUpdate({ ratingMax: Number(e.target.value) })
            }
            options={[
              { label: "5 stars", value: "5" },
              { label: "10 stars", value: "10" },
            ]}
            className="ml-3 h-7 w-24 text-xs"
          />
        )}
      </div>
    );
  }

  if (question.type === "yes_no") {
    return (
      <div className="flex gap-2">
        {["Yes", "No"].map((opt) => (
          <div
            key={opt}
            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium"
          >
            {opt}
          </div>
        ))}
      </div>
    );
  }

  if (hasOptions) {
    return (
      <div className="space-y-2">
        {(question.options ?? []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            {question.type === "checkbox" && (
              <Checkbox checked={false} disabled />
            )}
            {question.type === "multiple_choice" && (
              <div className="size-4 rounded-full border-2 border-border" />
            )}
            {readOnly ? (
              <span className="text-sm">{opt}</span>
            ) : (
              <Input
                value={opt}
                onChange={(e) => {
                  const options = [...(question.options ?? [])];
                  options[i] = e.target.value;
                  onUpdate({ options });
                }}
                className="h-8 flex-1 text-sm"
              />
            )}
            {!readOnly && (question.options?.length ?? 0) > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7"
                onClick={() => {
                  const options = (question.options ?? []).filter(
                    (_, idx) => idx !== i
                  );
                  onUpdate({ options });
                }}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              onUpdate({
                options: [
                  ...(question.options ?? []),
                  `Option ${(question.options?.length ?? 0) + 1}`,
                ],
              })
            }
          >
            <Plus className="size-3" />
            Add option
          </Button>
        )}
      </div>
    );
  }

  return null;
}
