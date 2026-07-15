import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type {
  ApiListParams,
  ApiResponse,
  PaginatedResponse,
} from "@/types";
import type { Account } from "@/types/account";
import type {
  AuthSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth";
import type { Contact } from "@/types/contact";
import type { Deal } from "@/types/deal";
import type { Lead } from "@/types/lead";
import type { Task } from "@/types/task";
import type { Activity } from "@/types/activity";
import type { User, UserProfile } from "@/types/user";
import { createQueryString } from "@/lib/utils";

const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  users: "/users",
  accounts: "/accounts",
  contacts: "/contacts",
  leads: "/leads",
  deals: "/deals",
  tasks: "/tasks",
  activities: "/activities",
} as const;

function withQuery(path: string, params?: ApiListParams): string {
  if (!params) return path;
  return `${path}${createQueryString(params as Record<string, string | number | boolean | undefined>)}`;
}

export const authService = {
  login(credentials: LoginCredentials) {
    return apiPost<ApiResponse<AuthSession>>(
      endpoints.auth.login,
      credentials
    );
  },

  register(payload: RegisterPayload) {
    return apiPost<ApiResponse<AuthSession>>(
      endpoints.auth.register,
      payload
    );
  },

  logout() {
    return apiPost<ApiResponse<null>>(endpoints.auth.logout);
  },

  refresh(refreshToken: string) {
    return apiPost<ApiResponse<AuthSession>>(endpoints.auth.refresh, {
      refreshToken,
    });
  },

  getSession() {
    return apiGet<ApiResponse<AuthSession>>(endpoints.auth.me);
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiPost<ApiResponse<null>>(
      endpoints.auth.forgotPassword,
      payload
    );
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiPost<ApiResponse<null>>(
      endpoints.auth.resetPassword,
      payload
    );
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiPost<ApiResponse<null>>(
      endpoints.auth.changePassword,
      payload
    );
  },
};

export const userService = {
  getProfile() {
    return apiGet<ApiResponse<UserProfile>>(`${endpoints.users}/me`);
  },

  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<User>>(
      withQuery(endpoints.users, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<User>>(`${endpoints.users}/${id}`);
  },

  update(id: string, data: Partial<UserProfile>) {
    return apiPatch<ApiResponse<UserProfile>>(
      `${endpoints.users}/${id}`,
      data
    );
  },
};

export const accountService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Account>>(
      withQuery(endpoints.accounts, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Account>>(`${endpoints.accounts}/${id}`);
  },

  create(data: Omit<Account, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Account>>(endpoints.accounts, data);
  },

  update(id: string, data: Partial<Account>) {
    return apiPatch<ApiResponse<Account>>(
      `${endpoints.accounts}/${id}`,
      data
    );
  },

  delete(id: string) {
    return apiDelete<ApiResponse<null>>(`${endpoints.accounts}/${id}`);
  },
};

export const contactService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Contact>>(
      withQuery(endpoints.contacts, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Contact>>(`${endpoints.contacts}/${id}`);
  },

  create(data: Omit<Contact, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Contact>>(endpoints.contacts, data);
  },

  update(id: string, data: Partial<Contact>) {
    return apiPatch<ApiResponse<Contact>>(
      `${endpoints.contacts}/${id}`,
      data
    );
  },

  delete(id: string) {
    return apiDelete<ApiResponse<null>>(`${endpoints.contacts}/${id}`);
  },
};

export const leadService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Lead>>(
      withQuery(endpoints.leads, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Lead>>(`${endpoints.leads}/${id}`);
  },

  create(data: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Lead>>(endpoints.leads, data);
  },

  update(id: string, data: Partial<Lead>) {
    return apiPatch<ApiResponse<Lead>>(`${endpoints.leads}/${id}`, data);
  },

  delete(id: string) {
    return apiDelete<ApiResponse<null>>(`${endpoints.leads}/${id}`);
  },

  convert(id: string) {
    return apiPost<ApiResponse<Contact>>(`${endpoints.leads}/${id}/convert`);
  },
};

export const dealService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Deal>>(
      withQuery(endpoints.deals, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Deal>>(`${endpoints.deals}/${id}`);
  },

  create(data: Omit<Deal, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Deal>>(endpoints.deals, data);
  },

  update(id: string, data: Partial<Deal>) {
    return apiPatch<ApiResponse<Deal>>(`${endpoints.deals}/${id}`, data);
  },

  delete(id: string) {
    return apiDelete<ApiResponse<null>>(`${endpoints.deals}/${id}`);
  },
};

export const taskService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Task>>(
      withQuery(endpoints.tasks, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Task>>(`${endpoints.tasks}/${id}`);
  },

  create(data: Omit<Task, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Task>>(endpoints.tasks, data);
  },

  update(id: string, data: Partial<Task>) {
    return apiPatch<ApiResponse<Task>>(`${endpoints.tasks}/${id}`, data);
  },

  delete(id: string) {
    return apiDelete<ApiResponse<null>>(`${endpoints.tasks}/${id}`);
  },
};

export const activityService = {
  list(params?: ApiListParams) {
    return apiGet<PaginatedResponse<Activity>>(
      withQuery(endpoints.activities, params)
    );
  },

  getById(id: string) {
    return apiGet<ApiResponse<Activity>>(
      `${endpoints.activities}/${id}`
    );
  },

  create(data: Omit<Activity, "id" | "createdAt" | "updatedAt">) {
    return apiPost<ApiResponse<Activity>>(endpoints.activities, data);
  },
};
