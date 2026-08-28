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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
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
          "relative flex shrink-0 flex-col overflow-hidden bg-sidebar text-white",
          "border-r border-sidebar-border",
          "before:pointer-events-none before:absolute before:inset-y-0 before:right-0 before:w-px before:bg-linear-to-b before:from-blue-400/20 before:via-transparent before:to-violet-400/15",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 h-svh shadow-2xl"
            : "sticky top-0 z-40 h-svh",
          className
        )}
        style={{
          maxWidth: isMobile ? LAYOUT.sidebar.expanded : undefined,
        }}
      >
        <div
          className={cn(
            "relative flex h-[62px] shrink-0 items-center border-b border-sidebar-border/70 px-2.5",
            "bg-linear-to-b from-[#1e2a40] via-[#1c2538] to-sidebar",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-blue-400/35 before:to-transparent",
            "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-white/8 after:to-transparent",
            effectiveCollapsed && "justify-center px-2"
          )}
        >
          <SidebarLogo collapsed={effectiveCollapsed} />
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-2.5 py-4",
            "[scrollbar-width:thin] [scrollbar-color:#3a4558_transparent]",
            "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15"
          )}
        >
          <SidebarNav collapsed={effectiveCollapsed} />
        </div>

        <div
          className={cn(
            "shrink-0 px-2.5 py-3",
            effectiveCollapsed && "px-1.5 py-2"
          )}
        >
          <SidebarUserCard collapsed={effectiveCollapsed} />
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
