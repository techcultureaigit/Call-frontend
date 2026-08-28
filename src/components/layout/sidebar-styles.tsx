import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function sidebarRowClass(
  isActive: boolean,
  opts?: { collapsed?: boolean; nested?: boolean }
) {
  const { collapsed, nested } = opts ?? {};
  return cn(
    "group relative flex items-center transition-colors duration-150 ease-out",
    nested
      ? "gap-3 rounded-md py-2.5 pl-9 pr-3 text-[13px] leading-snug"
      : cn(
          "gap-3 rounded-md text-[13px] leading-snug",
          collapsed ? "justify-center px-2.5 py-3" : "min-h-10 px-3 py-3"
        ),
    isActive
      ? "bg-sidebar-active font-medium text-white"
      : "font-normal text-[#d4dae3] hover:bg-sidebar-hover hover:text-white"
  );
}

/** Uniform sidebar icons — muted when idle, white when active/hover */
export function sidebarIconClass(isActive: boolean) {
  return cn(
    "size-[18px] shrink-0 transition-colors duration-150",
    isActive ? "text-white" : "text-[#9aa5b8] group-hover:text-white/90"
  );
}

interface SidebarNavContentProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export function SidebarNavContent({
  icon: Icon,
  label,
  isActive,
}: SidebarNavContentProps) {
  return (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center">
        <Icon
          className={sidebarIconClass(isActive)}
          strokeWidth={isActive ? 2.1 : 1.85}
          fill="none"
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate leading-snug",
          isActive ? "text-white" : "text-[#d4dae3] group-hover:text-white"
        )}
      >
        {label}
      </span>
    </>
  );
}
