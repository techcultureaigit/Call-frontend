"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routePaths } from "@/config/navigation";
import { useAuth } from "@/hooks";
import { getInitials } from "@/lib/utils";

export function ProfileDropdown() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Account";
  const email = user?.email ?? "";
  const initials = user
    ? getInitials(user.firstName, user.lastName)
    : "AC";

  const handleLogout = async () => {
    await logout();
    router.push(routePaths.auth.login);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-9 rounded-[6px] p-0 text-white hover:bg-transparent hover:text-white"
          aria-label={`Account menu — ${displayName}`}
          disabled={!isHydrated}
        >
          <Avatar className="size-8">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={displayName} />
            )}
            <AvatarFallback className="bg-[#ffffff30] text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-1"
          >
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            )}
          </motion.div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={routePaths.settings.root}>
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
