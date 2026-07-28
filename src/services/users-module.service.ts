import {
  usersApi,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UsersListParams,
} from "@/api/users";
import { unwrapData } from "@/api/http";
import type { UserStatus } from "@/types/user";

export type { CreateUserPayload, UpdateUserPayload, UsersListParams };

export const usersModuleService = {
  list: (params: UsersListParams = {}) => usersApi.list(params),
  getById: (id: string) => unwrapData(usersApi.getById(id)),
  create: (payload: CreateUserPayload) => unwrapData(usersApi.create(payload)),
  update: (id: string, payload: UpdateUserPayload) =>
    unwrapData(usersApi.update(id, payload)),
  delete: (id: string) => unwrapData(usersApi.delete(id)),
  toggleStatus: (id: string, status: UserStatus) =>
    unwrapData(usersApi.update(id, { status })),
};
