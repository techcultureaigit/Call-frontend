"use client";

import {
  Brain,
  Check,
  GitBranch,
  List,
  Monitor,
  User,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AGENT_CONFIG_TABS } from "@/lib/constants/agent-config";
import type { AgentConfigTab } from "@/types/agent";

const TAB_ICONS: Record<AgentConfigTab, LucideIcon> = {
  persona: User,
  prompts: List,
  wisdom: Brain,
  functions: GitBranch,
  "post-call": Monitor,
};

interface AgentConfigTabsProps {
  active: AgentConfigTab;
  onChange: (tab: AgentConfigTab) => void;
}

export function AgentConfigTabs({ active, onChange }: AgentConfigTabsProps) {
  const activeIndex = AGENT_CONFIG_TABS.findIndex((t) => t.id === active);

  return (
    <div className="border-b border-border/50 pb-6">
      <ol className="flex items-center gap-1 overflow-x-auto scrollbar-thin sm:gap-0">
        {AGENT_CONFIG_TABS.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id as AgentConfigTab];
          const isActive = active === tab.id;
          const isDone = index < activeIndex;
          const isLast = index === AGENT_CONFIG_TABS.length - 1;

          return (
            <li
              key={tab.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <button
                type="button"
                onClick={() => onChange(tab.id as AgentConfigTab)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group relative flex shrink-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors sm:gap-3",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  !isActive && "hover:bg-muted/60"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="agent-step-active-pill"
                    className="absolute inset-0 z-0 rounded-xl bg-brand/8 ring-1 ring-inset ring-brand/15"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300",
                    isActive &&
                      "brand-gradient text-brand-foreground shadow-brand ring-2 ring-brand/20",
                    isDone &&
                      "bg-brand/12 text-brand ring-1 ring-inset ring-brand/25",
                    !isActive &&
                      !isDone &&
                      "bg-muted text-muted-foreground ring-1 ring-inset ring-border group-hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="agent-step-glow"
                      className="absolute inset-0 rounded-xl ring-2 ring-brand/30"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {isDone ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-[18px]" />
                  )}
                </span>
                <span className="relative z-10 hidden min-w-0 flex-col sm:flex">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                      isActive ? "text-brand" : "text-muted-foreground/70"
                    )}
                  >
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm font-semibold tracking-tight transition-colors",
                      isActive
                        ? "text-foreground"
                        : isDone
                          ? "text-foreground/80"
                          : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                </span>
              </button>

              {!isLast && (
                <span className="mx-1 hidden h-px flex-1 overflow-hidden rounded-full bg-border sm:block">
                  <motion.span
                    className="block h-full bg-brand"
                    initial={false}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
