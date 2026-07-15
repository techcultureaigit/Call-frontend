"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  HeartPulse,
  Layers,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATE_CATEGORY_OPTIONS } from "@/lib/constants/campaign-templates";
import type { TemplateCategory } from "@/types/campaign-template";

const CATEGORY_ICONS: Record<TemplateCategory | "all", React.ElementType> = {
  all: Layers,
  sales: Target,
  banking: Building2,
  insurance: Shield,
  healthcare: HeartPulse,
  customer_feedback: MessageSquare,
  lead_qualification: Sparkles,
  collections: CreditCard,
  custom: Phone,
};

interface TemplatesSidebarProps {
  active: TemplateCategory | "all";
  onChange: (category: TemplateCategory | "all") => void;
  counts?: Record<string, number>;
  className?: string;
}

export function TemplatesSidebar({
  active,
  onChange,
  counts,
  className,
}: TemplatesSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 lg:block",
        className
      )}
    >
      <div className="sticky top-4 space-y-1 rounded-2xl border border-border/50 bg-card/40 p-2 shadow-card backdrop-blur-md">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </p>
        {TEMPLATE_CATEGORY_OPTIONS.map((item, i) => {
          const Icon = CATEGORY_ICONS[item.value];
          const isActive = active === item.value;
          const count = counts?.[item.value];

          return (
            <motion.button
              key={item.value}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onChange(item.value)}
              className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                isActive
                  ? "bg-primary/10 font-medium text-primary shadow-subtle"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/5"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "relative size-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="relative min-w-0 flex-1 truncate">
                {item.label}
              </span>
              {count !== undefined && (
                <span
                  className={cn(
                    "relative rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
