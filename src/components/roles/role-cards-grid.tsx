"use client";

import { Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleCard } from "./role-card";
import type { RoleListItem } from "@/types/role";

interface RoleCardsGridProps {
  roles: RoleListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
  isLoading?: boolean;
}

export function RoleCardsGrid({
  roles,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  isLoading,
}: RoleCardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px] rounded-[6px]" />
        ))}
      </div>
    );
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {roles.map((role, index) => (
        <RoleCard
          key={role.id}
          role={role}
          isSelected={selectedId === role.id}
          onSelect={() => onSelect(role.id)}
          onEdit={() => onEdit(role)}
          onDelete={() => onDelete(role)}
          index={index}
        />
      ))}
    </div>
  );
}
