"use client";

import {
  Lock,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isProtectedRole, isSuperAdminRole, type RoleListItem } from "@/types/role";

interface RoleCardProps {
  role: RoleListItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index?: number;
}

export function RoleCard({
  role,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index = 0,
}: RoleCardProps) {
  const progress =
    role.totalPermissions > 0
      ? (role.permissionCount / role.totalPermissions) * 100
      : 0;
  const protectedRole = isProtectedRole(role.name);
  const superAdmin = isSuperAdminRole(role.name);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative w-full cursor-pointer rounded-[6px] border bg-card p-5 text-left shadow-card transition-all duration-200",
        "hover:shadow-elevated hover:border-border",
        isSelected
          ? "border-brand/35 ring-2 ring-brand/15 shadow-elevated"
          : "border-border/60"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[6px] bg-brand" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-[6px]",
              isSelected
                ? "bg-brand text-brand-foreground"
                : "bg-brand/10 text-brand"
            )}
          >
            <Shield className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                {role.name}
              </h3>
              {protectedRole && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Lock className="size-2.5" />
                  {superAdmin ? "Super Admin" : "System"}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit role
            </DropdownMenuItem>
            {!protectedRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete role
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {role.description ? (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {role.description}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="size-3" />
            {role.userCount} users
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {role.permissionCount}/{role.totalPermissions}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
