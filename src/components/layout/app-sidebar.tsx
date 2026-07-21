"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSidebarStore } from "@/stores";
import { useIsMobile, useIsTablet } from "@/hooks";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LAYOUT } from "./constants";
import { overlayTransition, sidebarTransition } from "./motion";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUserCard } from "./sidebar-user-card";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const closeMobile = useSidebarStore((state) => state.closeMobile);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const effectiveCollapsed = isCollapsed && !isMobile && !isTablet;
  const sidebarWidth = effectiveCollapsed
    ? LAYOUT.sidebar.collapsed
    : LAYOUT.sidebar.expanded;

  return (
    <TooltipProvider delayDuration={0}>
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[2px] md:hidden"
            onClick={closeMobile}
            aria-label="Close navigation menu"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? LAYOUT.sidebar.expanded : sidebarWidth,
          x: isMobile ? (isMobileOpen ? 0 : -LAYOUT.sidebar.expanded) : 0,
        }}
        transition={sidebarTransition}
        className={cn(
          "relative flex shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
          "shadow-[inset_-1px_0_0_0_color-mix(in_oklch,var(--sidebar-border)_55%,transparent)]",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 h-svh"
            : "relative z-auto h-svh",
          className
        )}
        style={{
          maxWidth: isMobile ? LAYOUT.sidebar.expanded : undefined,
        }}
      >
        {/* Layered depth: soft top accent wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(120% 42% at 8% 0%, color-mix(in oklch, var(--sidebar-primary) 9%, transparent) 0%, transparent 52%)",
          }}
        />

        <div
          className={cn(
            "relative z-10 flex h-16 shrink-0 items-center px-4",
            effectiveCollapsed && "justify-center px-3"
          )}
        >
          <SidebarLogo />
        </div>

        <div
          className={cn(
            "relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-3",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <SidebarNav collapsed={effectiveCollapsed} />
        </div>

        <div
          className={cn(
            "relative z-10 shrink-0 border-t border-sidebar-border/60 p-3",
            effectiveCollapsed && "px-2"
          )}
        >
          <SidebarUserCard collapsed={effectiveCollapsed} />
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
