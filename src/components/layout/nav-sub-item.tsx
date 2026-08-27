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
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2 rounded-[7px] py-1.5 pl-8 pr-2.5 text-[12.5px] font-medium tracking-[-0.01em]",
          "transition-colors duration-200 ease-out",
          "hover:bg-white/[0.06] hover:text-sidebar-foreground",
          isActive
            ? "bg-white text-neutral-900 shadow-[0_4px_12px_-6px_rgb(0_0_0/0.35)]"
            : "text-sidebar-foreground/70"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="absolute inset-y-1 left-[1.05rem] w-px bg-white/10" />
        {isActive && (
          <motion.span
            layoutId="sidebar-nested-active-dot"
            className="absolute left-[0.85rem] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-neutral-900 ring-2 ring-white"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
        {!isActive && (
          <span className="absolute left-[1.05rem] top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sidebar-foreground/40 transition-colors duration-200 group-hover:bg-sidebar-foreground/80" />
        )}
        <span className={cn("truncate", isActive && "font-semibold")}>{title}</span>
      </Link>
    </li>
  );
}
