"use client";

import { Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentAction } from "@/types/agent-action";

interface SavedActionsPanelProps {
  actions: AgentAction[];
  onDelete: (id: string) => void;
}

export function SavedActionsPanel({ actions, onDelete }: SavedActionsPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-4">
        <h2 className="text-base font-semibold text-foreground dark:text-foreground">
          Saved Actions
        </h2>
        <Badge className="min-w-[22px] justify-center rounded-full px-2 py-0.5 text-[11px]">
          {actions.length}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {actions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/60">
              <Zap className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No actions created yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Create your first action to see it here
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {actions.map((action) => (
              <li
                key={action.id}
                className="group rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:border-primary/20 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{action.name}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1.5 rounded-full px-2 py-0 text-[10px] font-medium",
                        action.type === "mcp"
                          ? "border-violet-500/30 text-violet-600"
                          : "border-sky-500/30 text-sky-600"
                      )}
                    >
                      {action.type === "mcp" ? "MCP Server" : "Custom API"}
                    </Badge>
                    <p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">
                      {action.type === "mcp"
                        ? action.mcpServerUrl
                        : `${action.method} ${action.endpoint}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onDelete(action.id)}
                    aria-label={`Delete ${action.name}`}
                  >
                    <Trash2 className="size-3.5 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
