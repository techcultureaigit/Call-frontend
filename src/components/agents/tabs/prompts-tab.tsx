"use client";

import { useState } from "react";
import { Loader2, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AgentPromptsConfig } from "@/types/agent";

interface PromptsTabProps {
  values: AgentPromptsConfig;
  onChange: (values: AgentPromptsConfig) => void;
}

export function PromptsTab({ values, onChange }: PromptsTabProps) {
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const update = <K extends keyof AgentPromptsConfig>(
    key: K,
    val: AgentPromptsConfig[K]
  ) => onChange({ ...values, [key]: val });

  const handleEditWithAi = () => {
    setLoadingPrompt(true);
    setTimeout(() => {
      update(
        "systemPrompt",
        values.systemPrompt +
          "\n\n[AI-enhanced] Added empathy cues and objection handling patterns."
      );
      setLoadingPrompt(false);
    }, 1500);
  };

  const greetingLeft = 250 - values.greeting.length;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="greeting">Agent Greetings</Label>
        <textarea
          id="greeting"
          value={values.greeting}
          onChange={(e) => update("greeting", e.target.value)}
          rows={3}
          maxLength={250}
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p
          className={cn(
            "text-xs",
            greetingLeft < 20 ? "text-amber-600" : "text-muted-foreground"
          )}
        >
          {greetingLeft} characters left
        </p>
      </div>

      <div className="max-w-xs space-y-1.5">
        <Label>Agent Greets First?</Label>
        <Select
          value={values.greetsFirst ? "yes" : "no"}
          onChange={(e) => update("greetsFirst", e.target.value === "yes")}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          className="rounded-[6px]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Agent Prompt</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditWithAi}
              disabled={loadingPrompt}
              className="rounded-[6px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10"
            >
              <Sparkles className="size-3.5 text-violet-600" />
              Edit with AI
            </Button>
            <Button variant="outline" size="sm" className="rounded-[6px]">
              <History className="size-3.5" />
              Prompt History
            </Button>
          </div>
        </div>
        <div className="relative">
          {loadingPrompt ? (
            <div className="flex h-48 items-center justify-center rounded-[6px] border border-border/50 bg-muted/20">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading...
              </span>
            </div>
          ) : (
            <textarea
              value={values.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
              rows={10}
              className="w-full rounded-[6px] border border-input bg-transparent px-4 py-3 text-sm leading-relaxed shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Define your agent's system prompt..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
