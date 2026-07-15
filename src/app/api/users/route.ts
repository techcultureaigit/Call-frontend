import { NextResponse } from "next/server";
import {
  createUser,
  queryUsers,
  type UsersQueryParams,
} from "@/lib/data/users-repository";
import type { UserRole, UserStatus } from "@/types/user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: UsersQueryParams = {
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 10),
    search: searchParams.get("search") ?? "",
    role: (searchParams.get("role") as UserRole | "all") ?? "all",
    status: (searchParams.get("status") as UserStatus | "all") ?? "all",
    sortBy: (searchParams.get("sortBy") as UsersQueryParams["sortBy"]) ?? "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
  };

  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(queryUsers(params));
}

export async function POST(request: Request) {
  const body = await request.json();

  const user = createUser({
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    role: body.role,
    status: body.status ?? "invited",
    phone: body.phone,
    timezone: body.timezone,
  });

  return NextResponse.json({ success: true, data: user }, { status: 201 });
}
