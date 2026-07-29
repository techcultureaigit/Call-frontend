"use client";

import { useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getSurveyQuestionTypeLabel,
  SURVEY_QUESTION_TYPES,
} from "@/lib/constants/agent-config";
import { downloadSurveyQuestionsSample } from "@/lib/constants/survey-upload-samples";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import { surveysModuleService } from "@/services/surveys-module.service";
import { cn } from "@/lib/utils";
import type {
  AgentSurveyQuestion,
  AgentSurveyQuestionOption,
  AgentSurveyQuestionsConfig,
} from "@/types/agent";

interface SurveyQuestionsTabProps {
  surveyId?: string;
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

const TYPE_OPTIONS = SURVEY_QUESTION_TYPES.map((t) => ({
  label: t.label,
  value: t.value,
}));

export function SurveyQuestionsTab({
  surveyId,
  values,
  onChange,
}: SurveyQuestionsTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [questionType, setQuestionType] = useState("text");
  const [questionText, setQuestionText] = useState("");
  const [optionsPipe, setOptionsPipe] = useState("");

  const isMulti = questionType === "multi";
  const fileUrl = getContactFileOpenUrl(values.questionsFileUrl || "");

  const updateQuestions = (questions: AgentSurveyQuestion[]) => {
    onChange({
      ...values,
      // Manual edits clear uploaded file metadata
      questionsFileUrl: "",
      questionsFileName: "",
      questions,
    });
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

    updateQuestions([
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

  const handleUpload = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(lower)) {
      toast.error("Only Excel (.xlsx / .xls) or CSV files are allowed");
      return;
    }

    if (!surveyId) {
      toast.error("Save previous steps first to upload questions");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await surveysModuleService.uploadQuestionsFile(
        surveyId,
        file
      );
      const sq = uploaded.config.surveyQuestions;
      onChange({
        enabled: sq.enabled,
        questionsFileUrl: sq.questionsFileUrl || "",
        questionsFileName: sq.questionsFileName || file.name,
        questions: sq.questions,
      });
      toast.success(
        `Uploaded ${sq.questions.length} question(s) — Cloudinary URL saved`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload questions"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearUpload = () => {
    onChange({
      ...values,
      questionsFileUrl: "",
      questionsFileName: "",
      questions: [],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Survey Questions
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload CSV/Excel for Cloudinary URL, or add questions manually.
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
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-border/70 bg-card px-4 py-8 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Upload Excel or CSV"}
          </span>
          <span className="max-w-sm text-[11px] text-muted-foreground">
            Columns: question, type, options — sample CSV available below.
          </span>
        </button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadSurveyQuestionsSample}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-3.5" />
            Download sample CSV
          </Button>
        </div>

        {values.questionsFileUrl || values.questionsFileName ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-border/60 bg-card px-3 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {values.questionsFileName || "Uploaded file"}
              </p>
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">{fileUrl}</span>
                </a>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {values.questions.length} question(s) loaded
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearUpload}
              aria-label="Remove uploaded questions file"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4",
          !values.enabled && "pointer-events-none opacity-55"
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Add manually
        </p>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isMulti) {
                  e.preventDefault();
                  addQuestion();
                }
              }}
            />
          </div>
        </div>

        {isMulti ? (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Choices
            </Label>
            <Input
              value={optionsPipe}
              onChange={(e) => setOptionsPipe(e.target.value)}
              placeholder="Option A | Option B | Option C"
            />
          </div>
        ) : null}

        <Button type="button" onClick={addQuestion} className="h-10 px-4">
          <Plus className="size-4" />
          Add question
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Manual questions are saved without a Cloudinary file URL.
        </p>
      </div>

      {values.questions.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No questions yet. Upload a CSV or add one manually.
        </p>
      ) : (
        <ul className="space-y-2">
          {values.questions.map((q, index) => (
            <li
              key={q.id}
              className="rounded-[8px] border border-border/50 bg-card px-3.5 py-3"
            >
              <div className="flex items-start gap-3">
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
                  {q.options && q.options.length > 0 ? (
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
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    updateQuestions(
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
          ))}
        </ul>
      )}
    </div>
  );
}
