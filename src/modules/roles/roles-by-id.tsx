"use client";

/**
 * roles-by-id.tsx
 * Load one role by id for edit.
 * Route: /roles/[id]/edit
 *
 * API calls in this file:
 *   getRole() → GET /api/roles/:id
 */

import { getRole } from "./api";
import { RolesCreateEditView } from "./roles-form";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/role";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Viewport-centered popup while fetching by id (same as list / delete / save). */
export function RolesFetchLoader({
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <AppLoader
      variant="page"
      label={label}
      hint="Fetching role details"
    />
  );
}

/** Fetch role once by id; returns undefined while loading */
export function useRoleById(id: string) {
  const [role, setRole] = useState<Role | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setRole(undefined);

    (async () => {
      try {
        // API: getRole() → GET /api/roles/:id
        const data = await getRole(id);
        if (!cancelled) setRole(data);
      } catch {
        if (!cancelled) setRole(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return role;
}

function RoleNotFound({ onBack }: { onBack: () => void }) {
  return (
    <PageContainer size="full" className="pt-10">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-[6px] bg-primary/10">
          <Shield className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Role not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This role may have been deleted or is no longer available.
        </p>
        <Button className="mt-5 rounded-[6px]" onClick={onBack}>
          Back to roles
        </Button>
      </div>
    </PageContainer>
  );
}

function RoleByIdShell({
  id,
  children,
}: {
  id: string;
  children: (role: Role) => ReactNode;
}) {
  const router = useRouter();
  const role = useRoleById(id);

  if (role === undefined) {
    return <RolesFetchLoader label="Loading role" />;
  }

  if (!role) {
    return <RoleNotFound onBack={() => router.push("/roles")} />;
  }

  return <>{children(role)}</>;
}

/** Route: /roles/[id]/edit — edit existing role */
export function RolesCreateEditLoader({ id }: { id: string }) {
  return (
    <RoleByIdShell id={id}>
      {(role) => <RolesCreateEditView role={role} />}
    </RoleByIdShell>
  );
}
