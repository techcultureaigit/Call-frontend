"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
  updateUserStatus,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UsersListParams,
} from "./api";
import type { UserStatus } from "@/types/user";

export function useUsers(params: UsersListParams) {
  return useQuery({
    queryKey: queryKeys.users.module(params as Record<string, unknown>),
    queryFn: () => listUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => getUser(id!),
    enabled: Boolean(id),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["users", "module"] });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User created successfully");
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create user"),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      toast.success("User updated successfully");
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update user"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete user"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => invalidate(),
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update status"),
  });

  return {
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    toggleStatus: toggleStatusMutation,
  };
}

export type { CreateUserPayload, UpdateUserPayload, UsersListParams };
