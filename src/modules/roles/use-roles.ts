"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "./api";

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useRoles(search = "") {
  return useQuery({
    queryKey: queryKeys.roles.module({ search }),
    queryFn: () => listRoles(search),
    placeholderData: (prev) => prev,
  });
}

export function useRoleDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id ?? ""),
    queryFn: () => getRole(id!),
    enabled: Boolean(id),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["roles", "module"] });
    queryClient.invalidateQueries({ queryKey: ["roles", "detail"] });
  };

  const createRoleMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      toast.success("Role created successfully");
      invalidate();
    },
    onError: (error) =>
      toast.error(mutationErrorMessage(error, "Failed to create role")),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: () => {
      toast.success("Role updated successfully");
      invalidate();
    },
    onError: (error) =>
      toast.error(mutationErrorMessage(error, "Failed to update role")),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      invalidate();
    },
    onError: (error) =>
      toast.error(mutationErrorMessage(error, "Failed to delete role")),
  });

  return {
    createRole: createRoleMutation,
    updateRole: updateRoleMutation,
    deleteRole: deleteRoleMutation,
  };
}

export type { CreateRolePayload, UpdateRolePayload };
