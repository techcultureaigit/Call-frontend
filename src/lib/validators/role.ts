import { z } from "zod";

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must be under 50 characters"),
  description: z
    .string()
    .max(200, "Description must be under 200 characters"),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
