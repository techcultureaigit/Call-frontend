"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getSurveyQuestionTypeLabel,
  SURVEY_QUESTION_TYPES,
} from "@/lib/constants/agent-config";
import { parseCSV } from "@/lib/utils/csv";
import { cn } from "@/lib/utils";
import type {
  AgentSurveyQuestion,
  AgentSurveyQuestionOption,
  AgentSurveyQuestionsConfig,
} from "@/types/agent";

interface SurveyQuestionsTabProps {
  values: AgentSurveyQuestionsConfig;
  onChange: (values: AgentSurveyQuestionsConfig) => void;
}

function makeOption(label: string): AgentSurveyQuestionOption {
  const trimmed = label.trim();
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: trimmed,
    value: trimmed.toLowerCase().replace(/\s+/g, "_"),
  };
}

function parseOptionsPipe(raw: string): AgentSurveyQuestionOption[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(makeOption);
}

const fieldClass =
  "h-11 border-border/70 bg-background/80 shadow-none focus-visible:border-brand focus-visible:ring-brand/15";

const TYPE_OPTIONS = SURVEY_QUESTION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

export function SurveyQuestionsTab({
  values,
  onChange,
}: SurveyQuestionsTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [questionType, setQuestionType] = useState("text");
  const [questionText, setQuestionText] = useState("");
  const [optionsPipe, setOptionsPipe] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isMulti = questionType === "multi";
  const allSelected =
    values.questions.length > 0 &&
    selectedIds.length === values.questions.length;

  const setQuestions = (questions: AgentSurveyQuestion[]) => {
    onChange({ ...values, questions });
    setSelectedIds((prev) => prev.filter((id) => questions.some((q) => q.id === id)));
  };

  const addQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Enter a question first");
      return;
    }
    const options = isMulti ? parseOptionsPipe(optionsPipe) : [];
    if (isMulti && options.length < 2) {
      toast.error("Add at least 2 options, separated by |");
      return;
    }

    setQuestions([
      ...values.questions,
      {
        id: `sq-${Date.now()}`,
        type: questionType,
        question: questionText.trim(),
        ...(isMulti ? { options } : {}),
      },
    ]);
    setQuestionText("");
    setOptionsPipe("");
  };

  const handleUploadQuestions = async (file: File) => {
    try {
      const rows = parseCSV(await file.text());
      const imported: AgentSurveyQuestion[] = [];

      for (const row of rows) {
        const question =
          row.question?.trim() || row.questions?.trim() || row.text?.trim();
        if (!question) continue;

        const typeRaw = (row.type || row.question_type || "text").toLowerCase();
        const type =
          SURVEY_QUESTION_TYPES.find((t) => t.value === typeRaw)?.value ??
          (typeRaw === "multiple_choice" ? "multi" : "text");
        const options = parseOptionsPipe(
          row.options || row.choices || row.option || ""
        );

        imported.push({
          id: `sq-upload-${Date.now()}-${imported.length}`,
          type,
          question,
          ...(type === "multi" && options.length > 0 ? { options } : {}),
        });
      }

      if (imported.length === 0) {
        toast.error("No valid questions in file");
        return;
      }
      setQuestions(imported);
      setSelectedIds([]);
      toast.success(`${imported.length} questions uploaded (replaced previous)`);
    } catch {
      toast.error("Failed to read file");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteSelected = () => {
    const remove = new Set(selectedIds);
    setQuestions(values.questions.filter((q) => !remove.has(q.id)));
    toast.success(
      selectedIds.length === 1
        ? "1 question deleted"
        : `${selectedIds.length} questions deleted`
    );
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Survey Questions
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create questions the agent asks during the survey call.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Enabled</span>
          <Switch
            checked={values.enabled}
            onCheckedChange={(enabled) => onChange({ ...values, enabled })}
          />
        </div>
      </div>

      <div
        className={cn(
          "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Type
            </Label>
            <Select
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                if (e.target.value !== "multi") setOptionsPipe("");
              }}
              options={TYPE_OPTIONS}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Question
            </Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. How satisfied are you with our service?"
              className={fieldClass}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isMulti) {
                  e.preventDefault();
                  addQuestion();
                }
              }}
            />
          </div>
        </div>

        {isMulti && (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Choices
            </Label>
            <Input
              value={optionsPipe}
              onChange={(e) => setOptionsPipe(e.target.value)}
              placeholder="Option A | Option B | Option C"
              className={fieldClass}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" onClick={addQuestion} className="h-10 px-4">
            <Plus className="size-4" />
            Add question
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUploadQuestions(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-10 px-4"
          >
            <Upload className="size-4" />
            Upload CSV
          </Button>
        </div>
      </div>

      {values.questions.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No questions yet. Add one or upload a CSV.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={allSelected}
                indeterminate={selectedIds.length > 0 && !allSelected}
                onChange={() =>
                  setSelectedIds(
                    allSelected ? [] : values.questions.map((q) => q.id)
                  )
                }
              />
              Select all
            </label>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete selected ({selectedIds.length})
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {values.questions.length} question
              {values.questions.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="space-y-2">
            {values.questions.map((q, index) => {
              const checked = selectedIds.includes(q.id);
              return (
                <li
                  key={q.id}
                  className={cn(
                    "rounded-[8px] border bg-card px-3.5 py-3",
                    checked
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={checked}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          checked
                            ? prev.filter((id) => id !== q.id)
                            : [...prev, q.id]
                        )
                      }
                      className="mt-1"
                    />
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-[4px] bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {getSurveyQuestionTypeLabel(q.type)}
                      </span>
                      <p className="mt-1.5 text-sm font-medium leading-snug">
                        {q.question}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((opt) => (
                            <span
                              key={opt.id}
                              className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setQuestions(
                          values.questions.filter((item) => item.id !== q.id)
                        )
                      }
                      aria-label="Remove question"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
