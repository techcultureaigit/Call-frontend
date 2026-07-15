"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  usersModuleService,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UsersListParams,
} from "@/services/users-module.service";
import type { UserStatus } from "@/types/user";

export function useUsers(params: UsersListParams) {
  return useQuery({
    queryKey: queryKeys.users.module(
      params as Record<string, unknown>
    ),
    queryFn: () => usersModuleService.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => usersModuleService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["users", "module"] });

  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      usersModuleService.create(payload),
    onSuccess: () => {
      toast.success("User created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create user"),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersModuleService.update(id, payload),
    onSuccess: () => {
      toast.success("User updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersModuleService.delete(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersModuleService.toggleStatus(id, status),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to update status"),
  });

  return { createUser, updateUser, deleteUser, toggleStatus };
}
