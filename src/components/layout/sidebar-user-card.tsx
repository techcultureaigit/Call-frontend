"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { routePaths } from "@/config/navigation";
import { useAuth } from "@/hooks";
import { cn, getInitials } from "@/lib/utils";

interface SidebarUserCardProps {
  collapsed?: boolean;
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.email ||
      "Admin User"
    : "Admin User";
  const email = user?.email ?? "admin@techculture.in";
  const initials = user
    ? getInitials(user.firstName || user.email || "A", user.lastName || "U")
    : "AU";

  const handleLogout = async () => {
    await logout();
    router.push(routePaths.auth.login);
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={routePaths.settings.root}
              className="flex size-9 items-center justify-center rounded-md bg-[#151c2c] ring-1 ring-sidebar-border transition-colors hover:bg-sidebar-hover"
            >
              <Avatar className="size-7 rounded-md">
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="rounded-md bg-[#2c3b59] text-[10px] font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="border-sidebar-border bg-sidebar-elevated text-sm text-white shadow-lg"
          >
            {displayName}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLogout}
              className="flex size-9 items-center justify-center rounded-md border border-sidebar-border text-[#9aa5b8] transition-colors hover:bg-sidebar-hover hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="border-sidebar-border bg-sidebar-elevated text-sm text-white shadow-lg"
          >
            Sign out
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-sidebar-border bg-[#151c2c] p-3">
        <Link
          href={routePaths.settings.root}
          className="group flex items-center gap-2.5 rounded-md py-0.5 transition-colors hover:bg-sidebar-hover"
        >
          <Avatar className="size-9 shrink-0 rounded-md">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={displayName} />
            )}
            <AvatarFallback className="rounded-md bg-[#2c3b59] text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-[#8b96a8]">{email}</p>
          </div>

          <ChevronRight className="size-4 shrink-0 text-[#8b96a8] transition-colors group-hover:text-white" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "mt-3 w-full rounded-md border border-sidebar-border py-2 text-[13px] font-normal text-[#9aa5b8]",
            "transition-colors hover:bg-sidebar-hover hover:text-white"
          )}
        >
          Sign out
        </button>
      </div>

      <p className="px-1 text-center text-[10px] leading-relaxed text-[#8b96a8]">
        Developed by : TechCulture <span aria-hidden>❤️</span> Made in India
      </p>
    </div>
  );
}
