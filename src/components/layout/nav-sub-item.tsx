"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { isRouteActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface NavSubItemProps {
  title: string;
  href: string;
  pathname: string;
  siblingHrefs: string[];
  onNavigate?: () => void;
}

export function NavSubItem({
  title,
  href,
  pathname,
  siblingHrefs,
  onNavigate,
}: NavSubItemProps) {
  const isActive = isRouteActive(pathname, href, siblingHrefs);

  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-[6px] py-2 pl-9 pr-3 text-[12.5px] font-medium tracking-[-0.01em]",
          "transition-[background-color,color] duration-[280ms] ease-out",
          "hover:bg-sidebar-elevated hover:text-sidebar-foreground",
          isActive
            ? "bg-white text-neutral-900 shadow-[0_6px_16px_-8px_rgb(0_0_0/0.4)]"
            : "text-sidebar-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Guide rail */}
        <span className="absolute inset-y-1 left-[1.15rem] w-px bg-sidebar-border/50" />
        {isActive && (
          <motion.span
            layoutId="sidebar-nested-active-dot"
            className="absolute left-[0.95rem] top-1/2 size-2 -translate-y-1/2 rounded-full bg-neutral-900 ring-2 ring-white"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
        {!isActive && (
          <span className="absolute left-[1.15rem] top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sidebar-foreground/50 transition-colors duration-[280ms] group-hover:bg-sidebar-foreground" />
        )}
        <span className={cn("truncate", isActive && "font-semibold")}>{title}</span>
      </Link>
    </motion.li>
  );
}
