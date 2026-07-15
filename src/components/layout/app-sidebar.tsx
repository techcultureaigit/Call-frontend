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
          "flex shrink-0 flex-col overflow-hidden",
          "border-r border-sidebar-border bg-sidebar",
          "shadow-[1px_0_0_0_var(--sidebar-glow)]",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 h-svh"
            : "relative z-auto h-svh",
          className
        )}
        style={{
          maxWidth: isMobile ? LAYOUT.sidebar.expanded : undefined,
        }}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border/80 px-4",
            effectiveCollapsed && "justify-center px-3"
          )}
        >
          <SidebarLogo />
        </div>

        <ScrollArea className="min-h-0 flex-1 px-2.5 py-4">
          <SidebarNav collapsed={effectiveCollapsed} />
        </ScrollArea>

        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border/80 p-2.5",
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
                  "w-full gap-2 text-sidebar-foreground/55",
                  "hover:bg-sidebar-hover hover:text-sidebar-foreground",
                  effectiveCollapsed && "size-9"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <>
                    <PanelLeftClose className="size-4" />
                    <span className="text-xs font-medium">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {effectiveCollapsed && (
              <TooltipContent
                side="right"
                sideOffset={14}
                className="border-sidebar-border bg-sidebar text-sidebar-foreground"
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
