import type { ID, Timestamps } from "./common";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification extends Timestamps {
  id: ID;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  href?: string;
}
