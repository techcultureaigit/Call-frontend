import { z } from "zod";

const userStatuses = [
  "active",
  "inactive",
  "invited",
  "suspended",
] as const;

/** roleId is a dynamic Mongo id from GET /roles */
export const userFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    roleId: z.string().min(1, "Role is required"),
    status: z.enum(userStatuses),
    password: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    // Password required only when creating (no existing password field skip)
    // Caller sets requirePassword via refined schema for create
    if (values.password !== undefined && values.password.length > 0 && values.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
  });

export const createUserFormSchema = userFormSchema.superRefine((values, ctx) => {
  if (!values.password || values.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 8 characters",
      path: ["password"],
    });
  }
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
] as const;
