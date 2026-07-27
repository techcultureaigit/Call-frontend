"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentFunctionsConfig } from "@/types/agent";

interface FunctionsTabProps {
  values: AgentFunctionsConfig;
  onChange: (values: AgentFunctionsConfig) => void;
}

export function FunctionsTab({ values, onChange }: FunctionsTabProps) {
  const toggleTool = (id: string) => {
    onChange({
      ...values,
      tools: values.tools.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      ),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold">Add Tool</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Select tools your agent can use during conversations.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {values.tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "relative rounded-[6px] border p-4 text-left transition-all hover:shadow-subtle",
                tool.enabled
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/50 bg-card/60"
              )}
            >
              <Badge
                variant="secondary"
                className="mb-3 rounded-md bg-violet-500/15 text-[10px] font-bold uppercase text-violet-700 dark:text-violet-400"
              >
                Tool
              </Badge>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tool Name
              </p>
              <p className="mt-0.5 text-sm font-semibold">{tool.name}</p>
              <div
                className={cn(
                  "absolute right-3 top-3 size-4 rounded-full border-2 transition-colors",
                  tool.enabled
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                )}
              >
                {tool.enabled && (
                  <span className="flex size-full items-center justify-center text-[8px] text-primary-foreground">
                    ✓
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
