import { z } from "zod";

const userStatuses = [
  "active",
  "inactive",
  "invited",
  "suspended",
] as const;

/** roleId is a dynamic Mongo id from GET /roles */
export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(userStatuses),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
] as const;
