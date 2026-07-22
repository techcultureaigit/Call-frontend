"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ConditionalRule, SurveyQuestion } from "@/types/survey";
import { QuestionPreviewStep } from "./question-preview-step";

function evaluateRule(
  rule: ConditionalRule,
  answers: Record<string, string>
): boolean {
  const answer = answers[rule.sourceQuestionId] ?? "";
  switch (rule.operator) {
    case "equals":
      return answer.toLowerCase() === rule.value.toLowerCase();
    case "not_equals":
      return answer.toLowerCase() !== rule.value.toLowerCase();
    case "contains":
      return answer.toLowerCase().includes(rule.value.toLowerCase());
    case "greater_than":
      return Number(answer) > Number(rule.value);
    case "less_than":
      return Number(answer) < Number(rule.value);
    default:
      return false;
  }
}

function isQuestionVisible(
  question: SurveyQuestion,
  answers: Record<string, string>
): boolean {
  if (!question.conditionalLogic?.length) return true;

  return question.conditionalLogic.every((rule) => {
    const matches = evaluateRule(rule, answers);
    return rule.action === "show" ? matches : !matches;
  });
}

interface SurveyPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description?: string;
  questions: SurveyQuestion[];
}

export function SurveyPreview({
  open,
  onOpenChange,
  name,
  description,
  questions,
}: SurveyPreviewProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const visibleQuestions = useMemo(
    () =>
      [...questions]
        .sort((a, b) => a.order - b.order)
        .filter((q) => isQuestionVisible(q, answers)),
    [questions, answers]
  );

  const current = visibleQuestions[step];
  const progress =
    visibleQuestions.length > 0
      ? ((step + 1) / visibleQuestions.length) * 100
      : 0;

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleClose = (next: boolean) => {
    if (!next) {
      setStep(0);
      setAnswers({});
    }
    onOpenChange(next);
  };

  const handleNext = () => {
    if (step < visibleQuestions.length - 1) setStep((s) => s + 1);
    else handleClose(false);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-[6px]">
        <div className="relative flex flex-1 flex-col bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
          <div className="absolute right-4 top-4 z-10">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleClose(false)}
              className="size-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="px-6 pt-6">
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {visibleQuestions.length > 0
                ? `${step + 1} of ${visibleQuestions.length}`
                : "No questions"}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-lg"
                >
                  {step === 0 && (
                    <div className="mb-8 text-center">
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {name}
                      </h1>
                      {description && (
                        <p className="mt-2 text-muted-foreground">
                          {description}
                        </p>
                      )}
                    </div>
                  )}

                  <QuestionPreviewStep
                    question={current}
                    value={answers[current.id] ?? ""}
                    onChange={(v) => setAnswer(current.id, v)}
                  />
                </motion.div>
              ) : (
                <p className="text-muted-foreground">No questions to preview</p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 bg-background/80 px-6 py-4 backdrop-blur-sm">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {step >= visibleQuestions.length - 1 ? "Finish" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
