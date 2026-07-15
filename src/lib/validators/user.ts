import { z } from "zod";

const userRoles = [
  "super_admin",
  "admin",
  "manager",
  "sales_rep",
  "viewer",
] as const;

const userStatuses = [
  "active",
  "inactive",
  "invited",
  "suspended",
] as const;

export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(userRoles, { required_error: "Role is required" }),
  status: z.enum(userStatuses),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const USER_ROLE_OPTIONS = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Sales Rep", value: "sales_rep" },
  { label: "Viewer", value: "viewer" },
] as const;

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
] as const;
