"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  KeyRound,
  Lock,
  Pencil,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import {
  isProtectedRole,
  isSuperAdminRole,
  type RoleListItem,
} from "@/types/role";

interface RolesTableProps {
  roles: RoleListItem[];
  onOpen: (role: RoleListItem) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
  isLoading?: boolean;
}

export function RolesTable({
  roles,
  onOpen,
  onEdit,
  onDelete,
  isLoading,
}: RolesTableProps) {
  if (isLoading) {
    return <RolesTableSkeleton />;
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={Shield}
          title="No roles found"
          description="Try a different search term or create a new role."
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[6px] border border-border/60 bg-card/95 shadow-elevated">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_12%,transparent),transparent_55%)]"
      />

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-border/50 bg-muted/35">
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Users
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Access coverage
              </th>
              <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => {
              const protectedRole = isProtectedRole(role.name);
              const superAdmin = isSuperAdminRole(role.name);
              const progress =
                role.totalPermissions > 0
                  ? (role.permissionCount / role.totalPermissions) * 100
                  : 0;

              const handleRowClick = (
                event: MouseEvent<HTMLTableRowElement>
              ) => {
                const target = event.target as HTMLElement;
                if (
                  target.closest(
                    "a, button, input, label, [data-row-ignore-click]"
                  )
                ) {
                  return;
                }
                onOpen(role);
              };

              return (
                <motion.tr
                  key={role.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.22 }}
                  onClick={handleRowClick}
                  className="group cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-muted/25"
                >
                  <td className="relative px-5 py-4">
                    <span
                      aria-hidden
                      className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-[8px] ring-1 transition-colors",
                          superAdmin
                            ? "bg-linear-to-br from-brand/25 to-brand/5 text-brand ring-brand/20"
                            : "bg-muted/70 text-foreground/80 ring-border/50 group-hover:bg-brand/10 group-hover:text-brand group-hover:ring-brand/20"
                        )}
                      >
                        {superAdmin ? (
                          <Lock className="size-4" />
                        ) : (
                          <Shield className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[15px] font-semibold tracking-tight text-foreground">
                          {role.name}
                        </p>
                        {role.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-muted-foreground/70">
                            Open to configure module permissions
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {protectedRole ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        <Lock className="size-3" />
                        {superAdmin ? "Locked" : "System"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/40">
                      <Users className="size-3.5 text-muted-foreground" />
                      {role.userCount}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-w-[160px] max-w-[220px] space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <KeyRound className="size-3" />
                          Permissions
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
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
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div
                      className="inline-flex h-8 items-center gap-0.5 rounded-[6px] border border-border/50 bg-muted/30 p-0.5 shadow-subtle transition-all duration-200 group-hover:border-border/80 group-hover:bg-card group-hover:shadow-card"
                      data-row-ignore-click
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-[5px] text-sky-700 hover:bg-sky-500/12 hover:text-sky-800 hover:ring-1 hover:ring-sky-500/20"
                        aria-label={superAdmin ? "View role" : "View permissions"}
                        title={superAdmin ? "View role" : "View permissions"}
                        onClick={() => onOpen(role)}
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      {!superAdmin ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-[5px] text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-800 hover:ring-1 hover:ring-emerald-500/20"
                          aria-label="Edit role"
                          title="Edit role"
                          onClick={() => onEdit(role)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      ) : (
                        <span
                          className="inline-flex size-7 items-center justify-center text-muted-foreground"
                          title="Super Admin is locked"
                        >
                          <Lock className="size-3.5" />
                        </span>
                      )}

                      {!protectedRole ? (
                        <>
                          <span
                            aria-hidden
                            className="mx-0.5 h-4 w-px bg-border/70"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-[5px] text-red-600 hover:bg-red-500/12 hover:text-red-700 hover:ring-1 hover:ring-red-500/20"
                            aria-label="Delete role"
                            title="Delete role"
                            onClick={() => onDelete(role)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border/40 bg-muted/20 px-5 py-2.5">
        <p className="text-[11px] text-muted-foreground">
          Click a role to open its permissions page.
        </p>
      </div>
    </div>
  );
}

function RolesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="space-y-0">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-4 last:border-0"
          >
            <Skeleton className="size-10 rounded-[8px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
