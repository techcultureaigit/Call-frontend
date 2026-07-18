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
        className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.8rem] ring-1 ring-inset ring-white/10"
        style={{
          background:
            "linear-gradient(155deg, color-mix(in oklch, var(--sidebar-primary) 90%, white) 0%, color-mix(in oklch, var(--sidebar-primary) 62%, black 20%) 100%)",
          boxShadow:
            "0 6px 18px -6px color-mix(in oklch, var(--sidebar-primary) 60%, transparent), inset 0 1px 0 0 color-mix(in oklch, white 35%, transparent)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-white/30 blur-[6px]" />
        <span className="relative text-[15px] font-bold tracking-tight text-sidebar-primary-foreground">
          {siteConfig.name.charAt(0)}
        </span>
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
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/40">
            <span className="size-1 rounded-full bg-sidebar-primary shadow-[0_0_6px_1px_var(--sidebar-primary)]" />
            Console
          </span>
        </motion.div>
      )}
    </Link>
  );
}
