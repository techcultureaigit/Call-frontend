"use client";

import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentTopNavProps {
  active?: string;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
}

export function AgentTopNav({
  active: _active = "configure",
  previewOpen = false,
  onTogglePreview,
}: AgentTopNavProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href="/agents"
        className="group inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex size-7 items-center justify-center rounded-lg border border-border/70 bg-card transition-colors group-hover:border-brand/40 group-hover:text-brand">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        </span>
        Back to Agents
      </Link>

      <div className="flex items-center gap-2">
        {onTogglePreview && (
          <button
            type="button"
            onClick={onTogglePreview}
            aria-pressed={previewOpen}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors",
              previewOpen
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border/70 bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >
            {previewOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRightOpen className="size-4" />
            )}
            <span className="hidden sm:inline">
              {previewOpen ? "Hide preview" : "Show preview"}
            </span>
          </button>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Draft
        </span>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </button>
      </div>
    </div>
  );
}
