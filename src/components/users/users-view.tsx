"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta, useUsers, useUserMutations } from "@/hooks";
import { UsersToolbar } from "./users-toolbar";
import { UsersTable } from "./users-table";
import { UsersPagination } from "./users-pagination";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { User, UserRole, UserStatus } from "@/types/user";

export function UsersView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string>();

  const debouncedSearch = useDebounce(search, 300);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch,
    role,
    status,
    sortBy: sortBy === "name" ? "name" : sortBy,
    sortOrder,
  });

  const { deleteUser, toggleStatus } = useUserMutations();

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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    await deleteUser.mutateAsync(selectedUser.id);
    setDeleteOpen(false);
    setSelectedUser(null);
  }, [selectedUser, deleteUser]);

  const handleToggleStatus = useCallback(
    async (user: User, active: boolean) => {
      setTogglingId(user.id);
      try {
        await toggleStatus.mutateAsync({
          id: user.id,
          status: active ? "active" : "inactive",
        });
      } finally {
        setTogglingId(undefined);
      }
    },
    [toggleStatus]
  );

  const openCreate = () => router.push("/users/new");
  const openEdit = (user: User) => router.push(`/users/${user.id}/edit`);

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
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
          totalCount={data?.meta.total}
        />

        <UsersTable
          users={data?.data ?? []}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          onEdit={openEdit}
          onDelete={openDelete}
          onToggleStatus={handleToggleStatus}
          isTogglingId={togglingId}
        />

        {data?.meta && data.meta.total > 0 && (
          <UsersPagination meta={data.meta} onPageChange={setPage} />
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selectedUser}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </PageContainer>
  );
}
