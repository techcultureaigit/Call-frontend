"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  rolesApi,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "@/api";
import { queryKeys } from "@/lib/constants/query-keys";

export function useRoles(search = "") {
  return useQuery({
    queryKey: queryKeys.roles.module({ search }),
    queryFn: () => rolesApi.list(search),
    placeholderData: (prev) => prev,
  });
}

export function useRoleDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id ?? ""),
    queryFn: () => rolesApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["roles", "module"] });

  const createRole = useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload),
    onSuccess: () => {
      toast.success("Role created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create role"),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesApi.update(id, payload),
    onSuccess: () => {
      toast.success("Role updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update role"),
  });

  const deleteRole = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete role"),
  });

  return { createRole, updateRole, deleteRole };
}
