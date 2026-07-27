"use client";

import { useState } from "react";
import {
  Copy,
  Flag,
  HelpCircle,
  Link2,
  MessageSquareText,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QUESTION_TYPES } from "@/lib/constants/agent-config";
import type { AgentPostCallConfig } from "@/types/agent";

interface PostCallTabProps {
  values: AgentPostCallConfig;
  onChange: (values: AgentPostCallConfig) => void;
}

function Hint({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button" className="inline-flex">
          <HelpCircle className="size-3.5 text-muted-foreground/70" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {children}
      </Label>
      {hint && <Hint text={hint} />}
    </div>
  );
}

export function PostCallTab({ values, onChange }: PostCallTabProps) {
  const [bucketName, setBucketName] = useState("");
  const [bucketDesc, setBucketDesc] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [questionText, setQuestionText] = useState("");

  const addBucket = () => {
    if (!bucketName.trim() || !bucketDesc.trim()) {
      toast.error("Add a bucket name and description");
      return;
    }
    onChange({
      ...values,
      dispositionBuckets: [
        ...values.dispositionBuckets,
        {
          id: `bucket-${Date.now()}`,
          name: bucketName.trim(),
          description: bucketDesc.trim(),
        },
      ],
    });
    setBucketName("");
    setBucketDesc("");
  };

  const removeBucket = (id: string) => {
    onChange({
      ...values,
      dispositionBuckets: values.dispositionBuckets.filter((b) => b.id !== id),
    });
  };

  const addQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Enter a question first");
      return;
    }
    onChange({
      ...values,
      questions: [
        ...values.questions,
        {
          id: `q-${Date.now()}`,
          type: questionType,
          question: questionText.trim(),
        },
      ],
    });
    setQuestionText("");
  };

  const removeQuestion = (id: string) => {
    onChange({
      ...values,
      questions: values.questions.filter((q) => q.id !== id),
    });
  };

  const copySecret = () => {
    if (!values.callbackSecret) {
      toast.error("Nothing to copy");
      return;
    }
    void navigator.clipboard.writeText(values.callbackSecret);
    toast.success("Secret copied");
  };

  const readyCount =
    (values.callbackUrl.trim() ? 1 : 0) +
    (values.dispositionBuckets.length > 0 ? 1 : 0) +
    (values.questions.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header — CallHub wrap-up framing */}
      <section className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        <div className="border-b border-border/40 bg-gradient-to-r from-brand/10 via-transparent to-transparent px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
            Step 5 · Close-out
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight">
            After the call ends
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Route results to your systems, tag outcomes, and extract answers for
            CallHub reports.
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {[
            {
              label: "Webhook",
              done: Boolean(values.callbackUrl.trim()),
              icon: Webhook,
            },
            {
              label: "Outcomes",
              done: values.dispositionBuckets.length > 0,
              icon: Flag,
            },
            {
              label: "Insights",
              done: values.questions.length > 0,
              icon: MessageSquareText,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-[6px] border px-3 py-2.5",
                  item.done
                    ? "border-brand/30 bg-brand/5"
                    : "border-border/60 bg-muted/20"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-[6px]",
                    item.done
                      ? "brand-gradient text-brand-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.done ? "Configured" : "Optional"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="border-t border-border/40 px-5 py-2.5 text-[11px] text-muted-foreground">
          {readyCount}/3 close-out blocks ready
        </p>
      </section>

      {/* Webhook delivery */}
      <section className="rounded-[6px] border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-brand/10 text-brand">
            <Link2 className="size-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold tracking-tight">
              Result delivery
            </h4>
            <p className="text-xs text-muted-foreground">
              Push transcripts and call events to your webhook the moment a call
              finishes.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel hint="HTTPS endpoint that receives post-call payloads">
              Callback URL
            </FieldLabel>
            <Input
              value={values.callbackUrl}
              onChange={(e) =>
                onChange({ ...values, callbackUrl: e.target.value })
              }
              placeholder="https://api.yourapp.com/hooks/callhub"
              className="font-mono text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel hint="Shared secret to verify webhook signatures">
              Signing secret
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                type="password"
                value={values.callbackSecret}
                onChange={(e) =>
                  onChange({ ...values, callbackSecret: e.target.value })
                }
                placeholder="••••••••••••"
                className="font-mono text-[13px]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copySecret}
                className="shrink-0"
                aria-label="Copy secret"
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disposition buckets */}
      <section className="rounded-[6px] border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-brand/10 text-brand">
              <Flag className="size-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold tracking-tight">
                Outcome tags
              </h4>
              <p className="text-xs text-muted-foreground">
                Label how each call ended so reporting stays clean.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {values.dispositionBuckets.length}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder="Tag name *"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBucket();
              }
            }}
          />
          <Input
            value={bucketDesc}
            onChange={(e) => setBucketDesc(e.target.value)}
            placeholder="Short description *"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBucket();
              }
            }}
          />
          <Button type="button" onClick={addBucket} className="sm:px-4">
            <Plus className="size-4" />
            Add tag
          </Button>
        </div>

        {values.dispositionBuckets.length === 0 ? (
          <div className="mt-4 rounded-[6px] border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No outcome tags yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Example: Interested, Callback, Not reachable, Completed survey
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {values.dispositionBuckets.map((b, index) => (
              <li
                key={b.id}
                className="flex items-start gap-3 rounded-[6px] border border-border/50 bg-muted/15 px-3 py-2.5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {b.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeBucket(b.id)}
                  aria-label={`Remove ${b.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Extraction questions */}
      <section className="rounded-[6px] border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-brand/10 text-brand">
              <MessageSquareText className="size-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold tracking-tight">
                Answers to extract
              </h4>
              <p className="text-xs text-muted-foreground">
                Structured fields CallHub pulls from the transcript after hangup.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {values.questions.length}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            options={QUESTION_TYPES}
          />
          <Input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What should we capture? *"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuestion();
              }
            }}
          />
          <Button type="button" onClick={addQuestion} className="sm:px-4">
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {values.questions.length === 0 ? (
          <div className="mt-4 rounded-[6px] border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No extraction questions
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Example: “Did the customer agree to a follow-up?” (Yes / No)
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {values.questions.map((q) => {
              const typeLabel =
                QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type;
              return (
                <li
                  key={q.id}
                  className="flex items-start gap-3 rounded-[6px] border border-border/50 bg-muted/15 px-3 py-2.5"
                >
                  <span className="mt-0.5 rounded-[4px] bg-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand ring-1 ring-brand/20">
                    {typeLabel}
                  </span>
                  <p className="min-w-0 flex-1 text-sm text-foreground">
                    {q.question}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeQuestion(q.id)}
                    aria-label="Remove question"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
