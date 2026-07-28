import {
  notificationsApi,
  type NotificationsListParams,
} from "@/api/notifications";
import { unwrapData } from "@/api/http";

export type { NotificationsListParams };

export const notificationsModuleService = {
  list: (params: NotificationsListParams = {}) =>
    notificationsApi.list(params),
  getFeed: (limit = 8, live = true) =>
    unwrapData(notificationsApi.getFeed(limit, live)),
  getStats: () => unwrapData(notificationsApi.getStats()),
  getById: (id: string) => unwrapData(notificationsApi.getById(id)),
  markAsRead: (id: string) => unwrapData(notificationsApi.markAsRead(id)),
  markAllAsRead: () => unwrapData(notificationsApi.markAllAsRead()),
  delete: (id: string) => unwrapData(notificationsApi.delete(id)),
};
