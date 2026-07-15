"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CONDITIONAL_ACTIONS,
  CONDITIONAL_OPERATORS,
} from "@/lib/constants/surveys";
import { generateRuleId } from "@/lib/data/mock-survey-questions";
import type { ConditionalRule, SurveyQuestion } from "@/types/survey";

interface ConditionalLogicBuilderProps {
  question: SurveyQuestion;
  allQuestions: SurveyQuestion[];
  rules: ConditionalRule[];
  onChange: (rules: ConditionalRule[]) => void;
}

export function ConditionalLogicBuilder({
  question,
  allQuestions,
  rules,
  onChange,
}: ConditionalLogicBuilderProps) {
  const priorQuestions = allQuestions.filter(
    (q) => q.order < question.order
  );

  const addRule = () => {
    const source = priorQuestions[0];
    if (!source) return;
    onChange([
      ...rules,
      {
        id: generateRuleId(),
        sourceQuestionId: source.id,
        operator: "equals",
        value: "",
        action: "show",
      },
    ]);
  };

  const updateRule = (id: string, patch: Partial<ConditionalRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conditional Logic
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={addRule}
          disabled={priorQuestions.length === 0}
        >
          <Plus className="size-3" />
          Add rule
        </Button>
      </div>

      {priorQuestions.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Add more questions above to enable conditional logic.
        </p>
      )}

      {rules.length === 0 && priorQuestions.length > 0 && (
        <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-[11px] text-muted-foreground">
          No rules yet. Show or hide this question based on previous answers.
        </p>
      )}

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="space-y-2 rounded-lg border border-border/60 bg-card p-3"
          >
            <Select
              value={rule.action}
              onChange={(e) =>
                updateRule(rule.id, {
                  action: e.target.value as ConditionalRule["action"],
                })
              }
              options={CONDITIONAL_ACTIONS.map((a) => ({
                label: a.label,
                value: a.value,
              }))}
              className="h-8 text-xs"
            />

            <p className="text-[10px] font-medium text-muted-foreground">
              this question when
            </p>

            <Select
              value={rule.sourceQuestionId}
              onChange={(e) =>
                updateRule(rule.id, { sourceQuestionId: e.target.value })
              }
              options={priorQuestions.map((q) => ({
                label: `Q${q.order + 1}: ${q.title.slice(0, 30)}`,
                value: q.id,
              }))}
              className="h-8 text-xs"
            />

            <Select
              value={rule.operator}
              onChange={(e) =>
                updateRule(rule.id, {
                  operator: e.target.value as ConditionalRule["operator"],
                })
              }
              options={CONDITIONAL_OPERATORS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className="h-8 text-xs"
            />

            <Input
              value={rule.value}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              placeholder="Value..."
              className="h-8 text-xs"
            />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs text-destructive hover:text-destructive"
              onClick={() => removeRule(rule.id)}
            >
              <Trash2 className="size-3" />
              Remove rule
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
