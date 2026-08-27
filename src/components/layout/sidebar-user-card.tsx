"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { routePaths } from "@/config/navigation";
import { useAuth } from "@/hooks";
import { cn, getInitials } from "@/lib/utils";

interface SidebarUserCardProps {
  collapsed?: boolean;
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const { user } = useAuth();

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.email ||
      "Admin User"
    : "Admin User";
  const roleLabel =
    (typeof user?.roleName === "string" && user.roleName) ||
    (typeof user?.role === "string" && user.role) ||
    "Admin";
  const initials = user
    ? getInitials(user.firstName || user.email || "A", user.lastName || "U")
    : "AU";

  return (
    <Link
      href={routePaths.settings.root}
      className={cn(
        "group flex items-center gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 transition-colors hover:bg-white/[0.08]",
        collapsed &&
          "justify-center border-0 bg-transparent p-1 hover:bg-white/10"
      )}
    >
      <Avatar className="size-7 ring-1 ring-brand/35">
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={displayName} />
        )}
        <AvatarFallback className="nav-active-gradient text-[10px] font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[12px] font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-[10px] text-sidebar-foreground/50">
            {roleLabel}
          </p>
        </div>
      )}
    </Link>
  );
}
