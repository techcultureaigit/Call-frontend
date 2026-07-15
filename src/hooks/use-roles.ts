"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  rolesModuleService,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "@/services/roles-module.service";

export function useRoles(search = "") {
  return useQuery({
    queryKey: queryKeys.roles.module({ search }),
    queryFn: () => rolesModuleService.list(search),
    placeholderData: (prev) => prev,
  });
}

export function useRoleDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id ?? ""),
    queryFn: () => rolesModuleService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["roles", "module"] });

  const createRole = useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      rolesModuleService.create(payload),
    onSuccess: () => {
      toast.success("Role created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create role"),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesModuleService.update(id, payload),
    onSuccess: () => {
      toast.success("Role updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update role"),
  });

  const deleteRole = useMutation({
    mutationFn: (id: string) => rolesModuleService.delete(id),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete role"),
  });

  return { createRole, updateRole, deleteRole };
}
