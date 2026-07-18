"use client";

import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore, useSidebarStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { HeaderSearch } from "./header-search";
import { NotificationBell } from "./notification-bell";
import { ProfileDropdown } from "./profile-dropdown";
import { ThemeToggle } from "./theme-toggle";
import { headerItemVariants } from "./motion";

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const pageTitle = useUIStore((state) => state.pageTitle);
  const breadcrumbs = useUIStore((state) => state.breadcrumbs);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);

  return (
    <header
      className={cn(
        "glass-strong sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 px-4",
        "border-b border-border/50 shadow-[0_1px_0_0_color-mix(in_oklch,var(--brand)_10%,transparent)]",
        "md:gap-4 lg:px-6",
        className
      )}
    >
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        className="flex shrink-0 items-center gap-2"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </Button>
      </motion.div>

      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        className="hidden min-w-0 flex-1 flex-col gap-0.5 md:flex md:max-w-xs lg:max-w-none"
      >
        {pageTitle && (
          <h1 className="truncate text-sm font-semibold tracking-tight">
            {pageTitle}
          </h1>
        )}
        <Breadcrumbs items={breadcrumbs} />
      </motion.div>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        className="flex min-w-0 flex-1 items-center justify-center md:flex-none md:justify-start lg:flex-1 lg:justify-center"
      >
        <HeaderSearch />
      </motion.div>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={headerItemVariants}
        className="flex shrink-0 items-center gap-0.5"
      >
        <ThemeToggle />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 md:block"
        />

        <NotificationBell />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 md:block"
        />

        <ProfileDropdown />
      </motion.div>
    </header>
  );
}
