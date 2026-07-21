"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { useSidebarStore } from "@/stores";
import { cn } from "@/lib/utils";

export function SidebarLogo() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        isCollapsed && "justify-center"
      )}
    >
      <motion.div
        layout
        className="nav-active-gradient relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.8rem] shadow-[0_8px_20px_-8px_color-mix(in_oklch,var(--brand)_70%,transparent)] ring-1 ring-inset ring-white/20"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-white/30 blur-[6px]" />
        <Phone className="relative size-4 text-white" strokeWidth={2.4} />
      </motion.div>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-w-0 flex-col"
        >
          <span className="truncate font-display text-[15px] font-semibold tracking-tight text-sidebar-foreground">
            {siteConfig.name}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/70">
            CRM Admin
          </span>
        </motion.div>
      )}
    </Link>
  );
}
