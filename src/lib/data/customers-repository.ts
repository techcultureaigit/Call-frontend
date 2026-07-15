import { CUSTOMER_OWNERS, MOCK_CUSTOMERS, generateCustomerId } from "@/lib/data/mock-customers";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type {
  Customer,
  CustomerImportRow,
  CustomerSource,
  CustomerStatus,
  CustomerTier,
} from "@/types/customer";

let customersDB: Customer[] = [...MOCK_CUSTOMERS];

export interface CustomersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus | "all";
  tier?: CustomerTier | "all";
  source?: CustomerSource | "all";
  ownerId?: string | "all";
  sortBy?: keyof Customer | "name";
  sortOrder?: "asc" | "desc";
}

function generateId(): string {
  return generateCustomerId();
}

export function queryCustomers(
  params: CustomersQueryParams = {}
): PaginatedResponse<Customer> {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    tier = "all",
    source = "all",
    ownerId = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...customersDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (status !== "all") filtered = filtered.filter((c) => c.status === status);
  if (tier !== "all") filtered = filtered.filter((c) => c.tier === tier);
  if (source !== "all") filtered = filtered.filter((c) => c.source === source);
  if (ownerId !== "all") filtered = filtered.filter((c) => c.ownerId === ownerId);

  filtered.sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "name") {
      aVal = `${a.firstName} ${a.lastName}`;
      bVal = `${b.firstName} ${b.lastName}`;
    } else {
      aVal = String(a[sortBy as keyof Customer] ?? "");
      bVal = String(b[sortBy as keyof Customer] ?? "");
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data: filtered.slice(start, start + limit), meta };
}

export function getAllFilteredCustomers(
  params: Omit<CustomersQueryParams, "page" | "limit">
): Customer[] {
  return queryCustomers({ ...params, page: 1, limit: 10000 }).data;
}

export function getCustomerById(id: string): Customer | undefined {
  return customersDB.find((c) => c.id === id);
}

export function createCustomer(
  payload: Omit<Customer, "id" | "createdAt" | "updatedAt">
): Customer {
  const now = new Date().toISOString();
  const customer: Customer = {
    ...payload,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  customersDB = [customer, ...customersDB];
  return customer;
}

export function updateCustomer(
  id: string,
  payload: Partial<Omit<Customer, "id" | "createdAt">>
): Customer | null {
  const index = customersDB.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated: Customer = {
    ...customersDB[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  customersDB[index] = updated;
  return updated;
}

export function deleteCustomer(id: string): boolean {
  const len = customersDB.length;
  customersDB = customersDB.filter((c) => c.id !== id);
  return customersDB.length < len;
}

export function bulkDeleteCustomers(ids: string[]): number {
  const set = new Set(ids);
  const before = customersDB.length;
  customersDB = customersDB.filter((c) => !set.has(c.id));
  return before - customersDB.length;
}

export function bulkUpdateStatus(
  ids: string[],
  status: CustomerStatus
): number {
  let count = 0;
  customersDB = customersDB.map((c) => {
    if (ids.includes(c.id)) {
      count += 1;
      return { ...c, status, updatedAt: new Date().toISOString() };
    }
    return c;
  });
  return count;
}

export function importCustomers(rows: CustomerImportRow[]): {
  imported: number;
  skipped: number;
} {
  let imported = 0;
  let skipped = 0;
  const owner = CUSTOMER_OWNERS[0];

  rows.forEach((row) => {
    if (!row.email || !row.firstName || !row.company) {
      skipped += 1;
      return;
    }
    const exists = customersDB.some(
      (c) => c.email.toLowerCase() === row.email.toLowerCase()
    );
    if (exists) {
      skipped += 1;
      return;
    }

    createCustomer({
      firstName: row.firstName,
      lastName: row.lastName ?? "",
      email: row.email,
      phone: row.phone,
      company: row.company,
      jobTitle: row.jobTitle,
      status: row.status ?? "lead",
      tier: row.tier ?? "smb",
      source: "import",
      ownerId: owner.id,
      ownerName: owner.name,
      tags: ["imported"],
      lifetimeValue: 0,
    });
    imported += 1;
  });

  return { imported, skipped };
}

export function getCustomerOwners() {
  return CUSTOMER_OWNERS;
}
