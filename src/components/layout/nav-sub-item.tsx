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
          "group relative flex items-center gap-2.5 rounded-[12px] py-2 pl-9 pr-3 text-[12.5px] font-medium tracking-[-0.01em]",
          "transition-[background-color,color] duration-[280ms] ease-out",
          "hover:bg-sidebar-elevated hover:text-sidebar-foreground",
          isActive
            ? "text-sidebar-active-foreground"
            : "text-sidebar-foreground/55"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Guide rail */}
        <span className="absolute inset-y-1 left-[1.15rem] w-px bg-sidebar-border/50" />
        {isActive && (
          <motion.span
            layoutId="sidebar-nested-active-dot"
            className="absolute left-[0.95rem] top-1/2 size-2 -translate-y-1/2 rounded-full bg-sidebar-primary shadow-[0_0_8px_1px_var(--sidebar-primary)] ring-2 ring-sidebar/60"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
        {!isActive && (
          <span className="absolute left-[1.15rem] top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sidebar-foreground/25 transition-colors duration-[280ms] group-hover:bg-sidebar-foreground/50" />
        )}
        <span className="truncate">{title}</span>
      </Link>
    </motion.li>
  );
}
