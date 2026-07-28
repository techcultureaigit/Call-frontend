import {
  activityLogsApi,
  type ActivityLogsListParams,
} from "@/api/activity-logs";
import { unwrapData } from "@/api/http";

export type { ActivityLogsListParams };

export const activityLogsModuleService = {
  list: (params: ActivityLogsListParams = {}) =>
    activityLogsApi.list(params),
  getStats: () => unwrapData(activityLogsApi.getStats()),
  getFilterOptions: () => unwrapData(activityLogsApi.getFilterOptions()),
  getById: (id: string) => unwrapData(activityLogsApi.getById(id)),
};
