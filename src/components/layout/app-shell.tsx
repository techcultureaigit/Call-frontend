"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background">
        <AppHeader />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={cn("bg-background", className)}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
