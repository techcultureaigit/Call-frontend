import { z } from "zod";

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must be under 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be under 200 characters"),
  color: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const ROLE_COLOR_OPTIONS = [
  { label: "Violet", value: "#7c3aed" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Blue", value: "#2563eb" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
  { label: "Slate", value: "#6b7280" },
] as const;
