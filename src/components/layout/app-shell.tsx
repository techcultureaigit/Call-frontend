"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/stores";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  useEffect(() => {
    void useSidebarStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar />

      <div className="app-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />

        <motion.main
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-clip overscroll-contain [&>*]:min-w-0",
            className
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
