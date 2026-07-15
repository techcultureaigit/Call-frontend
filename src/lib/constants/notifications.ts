import type { NotificationType } from "@/types/notification";

export const NOTIFICATION_TYPE_OPTIONS: {
  value: NotificationType | "all";
  label: string;
}[] = [
  { value: "all", label: "All types" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export const NOTIFICATION_READ_OPTIONS: {
  value: "all" | "read" | "unread";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];
