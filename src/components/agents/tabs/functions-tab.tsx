"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

      <div>
        <h3 className="text-sm font-semibold">Add Action</h3>
        {values.actions.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Plus className="size-7 text-primary" />
            </div>
            <p className="text-sm font-semibold">No Actions Available</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You haven&apos;t created any actions yet.
            </p>
            <Button asChild className="mt-4 rounded-[6px]">
              <Link href="/agents/actions">Create Your First Action</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {values.actions.map((action) => (
              <li
                key={action.id}
                className="rounded-[6px] border border-border/50 px-4 py-3 text-sm"
              >
                {action.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
