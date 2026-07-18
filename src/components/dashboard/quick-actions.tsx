"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Megaphone,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cardInteractiveClass } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tile: string;
}

const actions: QuickAction[] = [
  {
    title: "Create Agent",
    description: "Build a new voice agent",
    href: "/agents/new",
    icon: Bot,
    tile: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "New Campaign",
    description: "Launch an outreach campaign",
    href: "/campaigns/new",
    icon: Megaphone,
    tile: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Add Customer",
    description: "Onboard a new customer",
    href: "/customers",
    icon: UserPlus,
    tile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "View Reports",
    description: "Analyze performance data",
    href: "/reports",
    icon: BarChart3,
    tile: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Link
            href={action.href}
            className={cn(
              cardInteractiveClass,
              "group relative flex items-center gap-4 overflow-hidden p-4"
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                action.tile
              )}
            >
              <action.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {action.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
