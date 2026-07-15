import type { NextFontWithVariable } from "next/dist/compiled/@next/font";

export interface FontConfig {
  sans: NextFontWithVariable;
  mono: NextFontWithVariable;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];

export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
