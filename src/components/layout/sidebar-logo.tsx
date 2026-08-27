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
        "flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80",
        isCollapsed && "justify-center"
      )}
    >
      <motion.div
        layout
        className="nav-active-gradient relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[7px] shadow-[0_6px_16px_-8px_color-mix(in_oklch,var(--brand)_65%,transparent)] ring-1 ring-inset ring-white/18"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className="absolute -right-1.5 -top-1.5 size-4 rounded-full bg-white/25 blur-[5px]" />
        <Phone className="relative size-3.5 text-white" strokeWidth={2.4} />
      </motion.div>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-w-0 flex-col leading-tight"
        >
          <span className="truncate font-display text-[13.5px] font-semibold tracking-tight text-sidebar-foreground">
            {siteConfig.name}
          </span>
          <span className="mt-0.5 truncate text-[9px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/50">
            {siteConfig.tagline}
          </span>
        </motion.div>
      )}
    </Link>
  );
}
