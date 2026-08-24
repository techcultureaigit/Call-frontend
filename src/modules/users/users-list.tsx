"use client";

/**
 * users-list.tsx
 * Users list page — list, create, edit, delete.
 * Route: /users
 *
 * API calls in this file:
 *   listUsers()         → GET    /api/users
 *   deleteUser()        → DELETE /api/users/:id
 *   updateUserStatus()  → PATCH  /api/users/:id
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { usePageMeta, usePaginatedList } from "@/hooks";
import { isSuperAdminRole } from "@/types/role";
import type { User, UserStatus } from "@/types/user";
import { deleteUser, listUsers, updateUserStatus } from "./api";
import { DeleteUserDialog } from "./users-dialogs";
import { UsersPagination } from "./users-pagination";
import { UsersTable } from "./users-table";
import { UsersToolbar } from "./users-toolbar";

const PAGE_SIZE = 10;

/** Route: /users — list, create, edit, delete */
export function UsersListView() {
  const router = useRouter();
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string>();

  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const fetchPage = useCallback(
    async ({
      page,
      limit,
      search,
    }: {
      page: number;
      limit: number;
      search: string;
    }) => {
      try {
        // API: listUsers() → GET /api/users
        return await listUsers({
          page,
          limit,
          search: search || undefined,
          role,
          status,
          sortBy: sortBy === "name" ? "name" : sortBy,
          sortOrder,
        });
      } catch (error) {
        throw error;
      }
    },
    [role, status, sortBy, sortOrder]
  );

  const {
    search,
    setSearch,
    page,
    setPage,
    data: users,
    meta,
    isLoading,
    isRefreshing,
    reload,
  } = usePaginatedList<User>({
    pageSize: PAGE_SIZE,
    fetchPage,
    resetPageWhen: [role, status, sortBy, sortOrder],
    onError: () => toast.error("Failed to load users"),
  });

  const showLoader = isLoading || isRefreshing;

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Users",
    breadcrumbs: [
      { label: "Management", href: "/users" },
      { label: "Users" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      // API: deleteUser() → DELETE /api/users/:id
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setDeleteOpen(false);
      setSelectedUser(null);
      await reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [selectedUser, reload]);

  const handleToggleStatus = useCallback(
    async (user: User, active: boolean) => {
      if (isSuperAdminRole(user.roleName || user.role)) {
        toast.error("Super Admin status cannot be changed");
        return;
      }
      setTogglingId(user.id);
      try {
        // API: updateUserStatus() → PATCH /api/users/:id
        await updateUserStatus(user.id, active ? "active" : "inactive");
        await reload();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      } finally {
        setTogglingId(undefined);
      }
    },
    [reload]
  );

  const openCreate = () => router.push("/users/new");
  const openEdit = (user: User) => {
    if (isSuperAdminRole(user.roleName || user.role)) {
      toast.error("Super Admin cannot be edited");
      return;
    }
    router.push(`/users/${user.id}/edit`);
  };

  const openDelete = (user: User) => {
    if (isSuperAdminRole(user.roleName || user.role)) {
      toast.error("Super Admin cannot be deleted");
      return;
    }
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <UsersToolbar
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          onCreateClick={openCreate}
          totalCount={meta.total}
        />

        {showLoader ? (
          <AppLoader
            variant="section"
            label="Loading users"
            hint="Fetching latest data"
          />
        ) : null}
        {users.length > 0 || !showLoader ? (
          <>
            <UsersTable
              users={users}
              isLoading={false}
              sorting={sorting}
              onSortingChange={setSorting}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggleStatus={handleToggleStatus}
              isTogglingId={togglingId}
            />

            {meta.total > 0 && (
              <UsersPagination meta={meta} onPageChange={setPage} />
            )}
          </>
        ) : null}
      </motion.div>

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
    </div>
  );
}

/** @deprecated Use UsersListView */
export const UsersView = UsersListView;
