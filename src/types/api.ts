export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RequestConfig {
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface ApiListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | number | boolean>;
}
