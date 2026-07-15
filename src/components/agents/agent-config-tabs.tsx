"use client";

import {
  Brain,
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
  return (
    <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
      {AGENT_CONFIG_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.id as AgentConfigTab];
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id as AgentConfigTab)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "border-primary/30 bg-primary/10 text-primary shadow-subtle"
                : "border-transparent bg-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/40 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="agent-tab-active"
                className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/5"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative size-4 shrink-0" />
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
