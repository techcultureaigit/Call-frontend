"use client";

import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "@/types/survey";

interface QuestionPreviewStepProps {
  question: SurveyQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function QuestionPreviewStep({
  question,
  value,
  onChange,
}: QuestionPreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
          {question.title}
          {question.required && (
            <span className="ml-1 text-destructive">*</span>
          )}
        </h2>
        {question.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {question.description}
          </p>
        )}
      </div>

      {question.type === "text" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer..."}
          rows={4}
          className="w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}

      {question.type === "number" && (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "0"}
          className="h-12 rounded-xl text-lg"
        />
      )}

      {question.type === "rating" && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: question.ratingMax ?? 5 }).map((_, i) => {
            const rating = String(i + 1);
            const selected = Number(value) >= i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(rating)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "size-10 transition-colors",
                    selected
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}

      {question.type === "yes_no" && (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "flex-1 rounded-xl border-2 px-6 py-4 text-base font-medium transition-all",
                value === opt
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/60 hover:border-primary/40"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all",
                value === opt
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:border-primary/40"
              )}
            >
              <div
                className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  value === opt ? "border-primary bg-primary" : "border-border"
                )}
              />
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "checkbox" && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => {
            const selected = value.split(",").filter(Boolean).includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const current = value.split(",").filter(Boolean);
                  const next = selected
                    ? current.filter((v) => v !== opt)
                    : [...current, opt];
                  onChange(next.join(","));
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-primary/40"
                )}
              >
                <Checkbox checked={selected} />
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "dropdown" && (
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { label: "Select an option...", value: "" },
            ...(question.options ?? []).map((o) => ({ label: o, value: o })),
          ]}
          className="h-12 rounded-xl text-sm"
        />
      )}
    </div>
  );
}
