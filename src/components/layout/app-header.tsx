"use client";

import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "./header-search";
import { NotificationBell } from "./notification-bell";
import { ProfileDropdown } from "./profile-dropdown";
import { SidebarCollapseToggle } from "./sidebar-collapse-toggle";
import { ThemeToggle } from "./theme-toggle";
import { headerItemVariants } from "./motion";

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 pl-0 pr-4",
        "border-b border-sidebar-border/70 bg-linear-to-b from-[#1e2a40] via-[#1c2538] to-sidebar text-white",
        "md:gap-4 lg:pl-1 lg:pr-6",
        className
      )}
    >
      <motion.div
        custom={0}
        initial={false}
        animate="visible"
        variants={headerItemVariants}
        className="flex min-w-0 flex-1 items-center gap-2 md:gap-3"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="shrink-0 text-[#9aa5b8] hover:bg-sidebar-hover hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </Button>
        <SidebarCollapseToggle />

        <motion.div
          custom={1}
          initial={false}
          animate="visible"
          variants={headerItemVariants}
          className="min-w-0 flex-1 md:max-w-md"
        >
          <HeaderSearch />
        </motion.div>
      </motion.div>

      <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />

      <motion.div
        custom={2}
        initial={false}
        animate="visible"
        variants={headerItemVariants}
        className="flex shrink-0 items-center gap-1.5"
      >
        <ThemeToggle />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 bg-sidebar-border md:block"
        />

        <NotificationBell />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 bg-sidebar-border md:block"
        />

        <ProfileDropdown />
      </motion.div>
    </header>
  );
}
