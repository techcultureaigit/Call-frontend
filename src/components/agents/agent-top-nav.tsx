"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_TOP_NAV } from "@/lib/constants/agent-config";

export function AgentTopNav({ active = "configure" }: { active?: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/agents"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-1">
          {AGENT_TOP_NAV.map((item) => {
            const isActive = item.id === active;
            const href =
              item.id === "configure" ? "#" : item.href;
            return (
              <Link
                key={item.id}
                href={href}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-subtle"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Help"
      >
        <HelpCircle className="size-4" />
      </button>
    </div>
  );
}
