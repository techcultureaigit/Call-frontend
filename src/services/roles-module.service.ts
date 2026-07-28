import { rolesApi, type CreateRolePayload, type UpdateRolePayload } from "@/api/roles";
import { unwrapData } from "@/api/http";

export type { CreateRolePayload, UpdateRolePayload };

export const rolesModuleService = {
  list: (search = "") => unwrapData(rolesApi.list(search)),
  getById: (id: string) => unwrapData(rolesApi.getById(id)),
  create: (payload: CreateRolePayload) => unwrapData(rolesApi.create(payload)),
  update: (id: string, payload: UpdateRolePayload) =>
    unwrapData(rolesApi.update(id, payload)),
  delete: (id: string) => unwrapData(rolesApi.delete(id)),
};
