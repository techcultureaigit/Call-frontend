"use client";

import { GitBranch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getQuestionTypeMeta,
} from "@/lib/constants/surveys";
import type { SurveyQuestion } from "@/types/survey";
import { ConditionalLogicBuilder } from "./conditional-logic-builder";

interface QuestionSettingsPanelProps {
  question: SurveyQuestion | null;
  allQuestions: SurveyQuestion[];
  onUpdate: (patch: Partial<SurveyQuestion>) => void;
  onClose: () => void;
}

export function QuestionSettingsPanel({
  question,
  allQuestions,
  onUpdate,
  onClose,
}: QuestionSettingsPanelProps) {
  if (!question) {
    return (
      <aside className="hidden w-72 shrink-0 flex-col border-l border-border/60 bg-muted/10 xl:flex">
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-[6px] bg-muted">
            <GitBranch className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">Question Settings</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a question to edit settings and conditional logic
          </p>
        </div>
      </aside>
    );
  }

  const meta = getQuestionTypeMeta(question.type);

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-border/60 bg-muted/10 xl:flex">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </p>
          <p className="mt-0.5 text-sm font-medium">{meta.label}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="size-7">
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="space-y-2">
          <Label className="text-xs">Placeholder</Label>
          {["text", "number"].includes(question.type) ? (
            <Input
              value={question.placeholder ?? ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="h-8 text-sm"
            />
          ) : (
            <p className="text-xs text-muted-foreground">N/A for this type</p>
          )}
        </div>

        {question.type === "rating" && (
          <div className="space-y-2">
            <Label className="text-xs">Rating Scale</Label>
            <Select
              value={String(question.ratingMax ?? 5)}
              onChange={(e) =>
                onUpdate({ ratingMax: Number(e.target.value) })
              }
              options={[
                { label: "1 – 5", value: "5" },
                { label: "1 – 10", value: "10" },
              ]}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs">Required</Label>
          <Switch
            checked={question.required}
            onCheckedChange={(v) => onUpdate({ required: v })}
          />
        </div>

        <ConditionalLogicBuilder
          question={question}
          allQuestions={allQuestions}
          rules={question.conditionalLogic ?? []}
          onChange={(rules) => onUpdate({ conditionalLogic: rules })}
        />
      </div>
    </aside>
  );
}
