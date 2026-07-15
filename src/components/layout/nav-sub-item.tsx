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
          "group relative flex items-center gap-2.5 rounded-md py-2 pl-9 pr-3 text-[12.5px] font-medium tracking-[-0.01em]",
          "transition-all duration-200 ease-out",
          "hover:bg-sidebar-hover hover:text-sidebar-foreground",
          isActive
            ? "bg-sidebar-active/80 text-sidebar-active-foreground"
            : "text-sidebar-foreground/55"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-nested-active-dot"
            className="absolute left-4 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-sidebar-primary"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
        <span
          className={cn(
            "absolute left-4 top-1/2 size-1.5 -translate-y-1/2 rounded-full transition-colors duration-200",
            isActive
              ? "bg-transparent"
              : "bg-sidebar-foreground/20 group-hover:bg-sidebar-foreground/35"
          )}
        />
        <span className="truncate">{title}</span>
      </Link>
    </motion.li>
  );
}
