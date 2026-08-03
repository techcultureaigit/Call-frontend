"use client";

import {
  Brain,
  CalendarClock,
  Check,
  ClipboardList,
  GitBranch,
  List,
  MessageCircle,
  Monitor,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ENABLED_AGENT_CONFIG_TABS,
  isAgentConfigTabDisabled,
} from "@/lib/constants/agent-config";
import type { AgentConfigTab } from "@/types/agent";

const TAB_ICONS: Record<AgentConfigTab, LucideIcon> = {
  persona: User,
  prompts: List,
  // Upcoming — keep commented with tabs (do not delete)
  // functions: GitBranch,
  "survey-questions": ClipboardList,
  farewell: MessageCircle,
  "client-contact": Users,
  schedule: CalendarClock,
  // wisdom: Brain,
  // "post-call": Monitor,
  // Temporary stubs so Record<AgentConfigTab, …> still typechecks while upcoming tabs are commented out
  functions: GitBranch,
  wisdom: Brain,
  "post-call": Monitor,
};

interface SurveyConfigTabsProps {
  active: AgentConfigTab;
  onChange: (tab: AgentConfigTab) => void;
  /** @deprecated Upcoming steps are hidden from the stepper */
  showUpcoming?: boolean;
  completedTabs?: Partial<Record<AgentConfigTab, boolean>>;
}

export function SurveyConfigTabs({
  active,
  onChange,
  completedTabs = {},
}: SurveyConfigTabsProps) {
  const visibleTabs = ENABLED_AGENT_CONFIG_TABS;

  return (
    <nav aria-label="Survey configuration steps" className="w-full">
      <ol className="flex flex-col gap-1">
        {visibleTabs.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id as AgentConfigTab];
          const isDisabled = isAgentConfigTabDisabled(tab.id);
          const isActive = active === tab.id;
          const isDone = Boolean(completedTabs[tab.id as AgentConfigTab]);
          const isLast = index === visibleTabs.length - 1;

          return (
            <li key={tab.id} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => {
                  if (isDisabled) return;
                  onChange(tab.id as AgentConfigTab);
                }}
                disabled={isDisabled}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isDisabled}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isDisabled && "cursor-not-allowed opacity-55",
                  !isDisabled && !isActive && "hover:bg-muted/60"
                )}
              >
                {isActive && !isDisabled && (
                  <motion.span
                    layoutId="agent-step-active-pill"
                    className="absolute inset-0 z-0 rounded-[6px] bg-brand/8 ring-1 ring-inset ring-brand/15"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                <span
                  className={cn(
                    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-[6px] text-sm font-semibold transition-all duration-300",
                    isActive &&
                      !isDisabled &&
                      "brand-gradient text-brand-foreground shadow-brand ring-2 ring-brand/20",
                    isDone &&
                      !isActive &&
                      "bg-brand/12 text-brand ring-1 ring-inset ring-brand/25",
                    isDisabled &&
                      "bg-muted/70 text-muted-foreground/70 ring-1 ring-inset ring-border/70",
                    !isActive &&
                      !isDone &&
                      !isDisabled &&
                      "bg-muted text-muted-foreground ring-1 ring-inset ring-border group-hover:text-foreground"
                  )}
                >
                  {isDone && !isActive ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-[18px]" />
                  )}
                </span>

                <span className="relative z-10 min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                      isActive && !isDisabled
                        ? "text-brand"
                        : "text-muted-foreground/70"
                    )}
                  >
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold tracking-tight transition-colors",
                      isActive && !isDisabled
                        ? "text-foreground"
                        : isDone
                          ? "text-foreground/80"
                          : isDisabled
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                </span>
              </button>

              {!isLast && (
                <span className="ml-[1.4rem] my-0.5 h-4 w-px overflow-hidden rounded-full bg-border">
                  <motion.span
                    className="block w-full bg-brand"
                    initial={false}
                    animate={{ height: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
