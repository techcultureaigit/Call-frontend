import { MOCK_USERS } from "@/lib/data/mock-users";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type { User, UserRole, UserStatus } from "@/types/user";

let usersDB: User[] = [...MOCK_USERS];

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  sortBy?: keyof User | "name";
  sortOrder?: "asc" | "desc";
}

function generateId(): string {
  return `usr_${Date.now().toString(36)}`;
}

export function queryUsers(params: UsersQueryParams = {}): PaginatedResponse<User> {
  const {
    page = 1,
    limit = 10,
    search = "",
    role = "all",
    status = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...usersDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.firstName.toLowerCase().includes(q) ||
        user.lastName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q)
    );
  }

  if (role !== "all") {
    filtered = filtered.filter((user) => user.role === role);
  }

  if (status !== "all") {
    filtered = filtered.filter((user) => user.status === status);
  }

  filtered.sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    if (sortBy === "name") {
      aVal = `${a.firstName} ${a.lastName}`;
      bVal = `${b.firstName} ${b.lastName}`;
    } else {
      aVal = String(a[sortBy as keyof User] ?? "");
      bVal = String(b[sortBy as keyof User] ?? "");
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data, meta };
}

export function getUserById(id: string): User | undefined {
  return usersDB.find((user) => user.id === id);
}

export function createUser(
  payload: Omit<User, "id" | "createdAt" | "updatedAt">
): User {
  const now = new Date().toISOString();
  const user: User = {
    ...payload,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  usersDB = [user, ...usersDB];
  return user;
}

export function updateUser(
  id: string,
  payload: Partial<Omit<User, "id" | "createdAt">>
): User | null {
  const index = usersDB.findIndex((user) => user.id === id);
  if (index === -1) return null;

  const updated: User = {
    ...usersDB[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  usersDB[index] = updated;
  return updated;
}

export function deleteUser(id: string): boolean {
  const length = usersDB.length;
  usersDB = usersDB.filter((user) => user.id !== id);
  return usersDB.length < length;
}

export function resetUsersDB(): void {
  usersDB = [...MOCK_USERS];
}
