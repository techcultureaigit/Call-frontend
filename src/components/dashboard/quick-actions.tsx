"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  ClipboardList,
  PhoneCall,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tile: string;
  ring: string;
}

const actions: QuickAction[] = [
  {
    title: "Create Agent",
    description: "New voice AI agent",
    href: "/agents/new",
    icon: Bot,
    tile: "bg-gradient-to-br from-brand/20 to-brand-blue/10 text-brand",
    ring: "group-hover:ring-brand/30",
  },
  {
    title: "Survey Template",
    description: "Agent templates",
    href: "/agents/templates",
    icon: ClipboardList,
    tile: "bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
    ring: "group-hover:ring-violet-500/30",
  },
  {
    title: "Live Calls",
    description: "Monitor active calls",
    href: "/calls/live",
    icon: PhoneCall,
    tile: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    ring: "group-hover:ring-emerald-500/30",
  },
  {
    title: "Survey Data",
    description: "Customer records",
    href: "/customers",
    icon: UserPlus,
    tile: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
    ring: "group-hover:ring-cyan-500/30",
  },
  {
    title: "Reports",
    description: "Performance insights",
    href: "/reports",
    icon: BarChart3,
    tile: "bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    ring: "group-hover:ring-indigo-500/30",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
      {actions.map((action, index) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.28 }}
        >
          <Link
            href={action.href}
            className={cn(
              "group relative flex items-center gap-2.5 overflow-hidden rounded-[6px] border border-border/50 bg-card/80 px-3 py-3",
              "shadow-subtle transition-all duration-200",
              "hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card",
              "ring-1 ring-transparent",
              action.ring
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-[6px]",
                action.tile
              )}
            >
              <action.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-foreground">
                {action.title}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {action.description}
              </p>
            </div>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/35 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
