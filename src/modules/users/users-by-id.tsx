"use client";

/**
 * users-by-id.tsx
 * Load one user by id for edit.
 * Route: /users/[id]/edit
 *
 * API calls in this file:
 *   getUser() → GET /api/users/:id
 */

import { getUser } from "./api";
import { UsersCreateEditView } from "./users-form";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Viewport-centered popup while fetching by id (same as list / delete / save). */
export function UsersFetchLoader({
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <AppLoader
      variant="page"
      label={label}
      hint="Fetching user details"
    />
  );
}

/** Fetch user once by id; returns undefined while loading */
export function useUserById(id: string) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setUser(undefined);

    (async () => {
      try {
        // API: getUser() → GET /api/users/:id
        const data = await getUser(id);
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return user;
}

function UserNotFound({ onBack }: { onBack: () => void }) {
  return (
    <PageContainer size="full" className="pt-10">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-[6px] bg-primary/10">
          <UserRound className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">User not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This user may have been deleted or is no longer available.
        </p>
        <Button className="mt-5 rounded-[6px]" onClick={onBack}>
          Back to users
        </Button>
      </div>
    </PageContainer>
  );
}

function UserByIdShell({
  id,
  children,
}: {
  id: string;
  children: (user: User) => ReactNode;
}) {
  const router = useRouter();
  const user = useUserById(id);

  if (user === undefined) {
    return <UsersFetchLoader label="Loading user" />;
  }

  if (!user) {
    return <UserNotFound onBack={() => router.push("/users")} />;
  }

  return <>{children(user)}</>;
}

/** Route: /users/[id]/edit — edit existing user */
export function UsersCreateEditLoader({ id }: { id: string }) {
  return (
    <UserByIdShell id={id}>
      {(user) => <UsersCreateEditView user={user} />}
    </UserByIdShell>
  );
}
