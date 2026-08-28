"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  LineChart,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { routePaths } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "navy" | "blue";
}

const actions: QuickAction[] = [
  {
    title: "Create Survey",
    description: "New voice survey",
    href: routePaths.survey.new,
    icon: Plus,
    accent: "navy",
  },
  {
    title: "Response",
    description: "Survey responses",
    href: routePaths.survey.root,
    icon: ClipboardList,
    accent: "blue",
  },
  {
    title: "Report",
    description: "Performance insights",
    href: routePaths.analytics,
    icon: BarChart3,
    accent: "navy",
  },
  {
    title: "View Analytics",
    description: "Detailed breakdowns",
    href: `${routePaths.analytics}/details`,
    icon: LineChart,
    accent: "blue",
  },
];

const accentStyles = {
  navy: "bg-[#2c3b59]/10 text-[#2c3b59]",
  blue: "bg-[#3b82f6]/10 text-[#3b82f6]",
} as const;

export function QuickActions() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-subtle">
      <div className="grid grid-cols-2 divide-x divide-y divide-border/60 xl:grid-cols-4 xl:divide-y-0">
        {actions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <Link
              href={action.href}
              className={cn(
                "group flex flex-col items-start gap-3 px-5 py-5 transition-colors",
                "hover:bg-[#2c3b59]/3"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-[6px]",
                  accentStyles[action.accent]
                )}
              >
                <action.icon className="size-[18px]" strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {action.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
