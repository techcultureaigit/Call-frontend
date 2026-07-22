"use client";

import { useState } from "react";
import { HelpCircle, Plus, Copy } from "lucide-react";
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
import { toast } from "sonner";
import { QUESTION_TYPES } from "@/lib/constants/agent-config";
import type { AgentPostCallConfig } from "@/types/agent";

interface PostCallTabProps {
  values: AgentPostCallConfig;
  onChange: (values: AgentPostCallConfig) => void;
}

function SectionHeader({
  title,
  tooltip,
}: {
  title: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function PostCallTab({ values, onChange }: PostCallTabProps) {
  const [bucketName, setBucketName] = useState("");
  const [bucketDesc, setBucketDesc] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [questionText, setQuestionText] = useState("");

  const addBucket = () => {
    if (!bucketName.trim() || !bucketDesc.trim()) return;
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

  const addQuestion = () => {
    if (!questionText.trim()) return;
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

  const copySecret = () => {
    if (values.callbackSecret) {
      navigator.clipboard.writeText(values.callbackSecret);
      toast.success("Secret copied");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SectionHeader
          title="Post Call Callback URL"
          tooltip="Webhook URL to receive post-call events and transcripts"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Callback URL</Label>
            <Input
              value={values.callbackUrl}
              onChange={(e) =>
                onChange({ ...values, callbackUrl: e.target.value })
              }
              placeholder="https://your-webhook-url.com/callback"
              className="rounded-[6px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Callback Secret</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={values.callbackSecret}
                onChange={(e) =>
                  onChange({ ...values, callbackSecret: e.target.value })
                }
                placeholder="••••••••••••"
                className="rounded-[6px] font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copySecret}
                className="shrink-0 rounded-[6px]"
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border/40 pt-6">
        <SectionHeader
          title="Call Disposition Buckets"
          tooltip="Categorize call outcomes for reporting"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <Input
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder="Bucket Name *"
            className="rounded-[6px]"
          />
          <Input
            value={bucketDesc}
            onChange={(e) => setBucketDesc(e.target.value)}
            placeholder="Description *"
            className="rounded-[6px]"
          />
          <Button onClick={addBucket} size="icon" className="rounded-[6px]">
            <Plus className="size-4" />
          </Button>
        </div>
        {values.dispositionBuckets.map((b) => (
          <div
            key={b.id}
            className="flex justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
          >
            <span>
              <strong>{b.name}</strong> — {b.description}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-border/40 pt-6">
        <SectionHeader
          title="What questions do you want answered?"
          tooltip="Extract structured data after each call"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            options={QUESTION_TYPES}
            className="rounded-[6px]"
          />
          <Input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Question *"
            className="rounded-[6px]"
          />
          <Button onClick={addQuestion} size="icon" className="rounded-[6px]">
            <Plus className="size-4" />
          </Button>
        </div>
        {values.questions.map((q) => (
          <div
            key={q.id}
            className="rounded-lg bg-muted/30 px-3 py-2 text-sm"
          >
            <span className="text-xs text-muted-foreground">{q.type}</span>
            <p>{q.question}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
