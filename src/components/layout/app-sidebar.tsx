"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebarStore } from "@/stores";
import { useIsMobile, useIsTablet } from "@/hooks";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LAYOUT } from "./constants";
import { overlayTransition, sidebarTransition } from "./motion";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
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

        <ScrollArea className="relative z-10 min-h-0 flex-1 px-3 py-3">
          <SidebarNav collapsed={effectiveCollapsed} />
        </ScrollArea>

        <div
          className={cn(
            "relative z-10 shrink-0 p-3",
            effectiveCollapsed && "flex justify-center"
          )}
        >
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={effectiveCollapsed ? "icon-sm" : "sm"}
                onClick={toggleCollapsed}
                className={cn(
                  "group w-full justify-start gap-2.5 rounded-xl text-sidebar-foreground/55 transition-all duration-300",
                  "hover:bg-sidebar-elevated hover:text-sidebar-foreground",
                  effectiveCollapsed && "size-10 justify-center"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="size-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
                ) : (
                  <>
                    <PanelLeftClose className="size-[18px] transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span className="text-[13px] font-medium">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {effectiveCollapsed && (
              <TooltipContent
                side="right"
                sideOffset={14}
                className="border-sidebar-border bg-sidebar-elevated text-sidebar-foreground"
              >
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
