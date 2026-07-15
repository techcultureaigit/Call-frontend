import type { ID, Timestamps } from "./common";

export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task extends Timestamps {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  assigneeId: ID;
  createdById: ID;
  relatedType?: "account" | "contact" | "lead" | "deal";
  relatedId?: ID;
}
