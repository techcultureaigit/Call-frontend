export { useMounted } from "./use-mounted";
export { useDebounce } from "./use-debounce";
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from "./use-media-query";
export { useLocalStorage } from "./use-local-storage";
export { usePageMeta } from "./use-page-meta";
export { useAuth } from "./use-auth";
export { usePermissions } from "./use-permissions";
export { useKeyboardShortcut } from "./use-keyboard-shortcut";
export { useNavigation } from "./use-navigation";
export { usePaginatedList, EMPTY_PAGE_META } from "./use-paginated-list";

/** Feature hooks — live in modules/ */
export { useDashboard } from "@/modules/dashboard/use-dashboard";
export { useUsers, useUserMutations, useUserDetail } from "@/modules/users/use-users";
export { useRoles, useRoleMutations, useRoleDetail } from "@/modules/roles/use-roles";
export { useCalls, useCallStats, useCallDetail, useCallMutations } from "@/modules/calls/use-calls";
export {
  useResponses,
  useResponseStats,
  useResponseFilterOptions,
  useResponseDetail,
  useResponseMutations,
} from "@/modules/responses/use-responses";
export { useReports, useReportCampaigns } from "@/modules/reports/use-reports";
export {
  useNotifications,
  useNotificationFeed,
  useNotificationStats,
  useNotificationMutations,
} from "@/modules/notifications/use-notifications";
export {
  useActivityLogs,
  useActivityLogStats,
  useActivityLogFilterOptions,
  useActivityLogDetail,
} from "@/modules/activity-logs/use-activity-logs";
export { useVoices, useVoiceOptions, useVoiceDetail } from "@/modules/voices/use-voices";
