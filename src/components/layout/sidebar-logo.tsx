"use client";

import Link from "next/link";
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
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-subtle"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className="text-sm font-bold text-primary-foreground">C</span>
      </motion.div>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-w-0 flex-col"
        >
          <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            {siteConfig.name}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Admin
          </span>
        </motion.div>
      )}
    </Link>
  );
}
