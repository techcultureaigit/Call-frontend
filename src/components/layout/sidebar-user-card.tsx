"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { routePaths } from "@/config/navigation";
import { useAuth } from "@/hooks";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/types/user";

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
  viewer: "Viewer",
};

interface SidebarUserCardProps {
  collapsed?: boolean;
}

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const { user } = useAuth();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Admin User";
  const roleLabel = user ? roleLabels[user.role] : "Super Admin";
  const initials = user
    ? getInitials(user.firstName, user.lastName)
    : "AU";

  return (
    <Link
      href={routePaths.settings.root}
      className={cn(
        "group flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/5 p-2.5 transition-colors hover:bg-white/10",
        collapsed && "justify-center border-0 bg-transparent p-1.5 hover:bg-white/10"
      )}
    >
      <Avatar className="size-9 ring-2 ring-brand/40">
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={displayName} />
        )}
        <AvatarFallback className="nav-active-gradient text-[11px] font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/70">
            {roleLabel}
          </p>
        </div>
      )}
    </Link>
  );
}
