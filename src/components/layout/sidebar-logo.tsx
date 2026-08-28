"use client";

import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SidebarLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200",
        "hover:bg-white/5",
        collapsed && "justify-center px-1.5"
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#3b82f6]/12 ring-1 ring-[#3b82f6]/25">
        <PhoneCall
          className="size-[18px] text-[#60a5fa]"
          strokeWidth={2.1}
          aria-hidden
        />
      </div>

      {!collapsed && (
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium tracking-tight text-white">
            {siteConfig.name}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-normal text-[#9aa5b8]">
            {siteConfig.tagline}
          </p>
        </div>
      )}
    </Link>
  );
}
