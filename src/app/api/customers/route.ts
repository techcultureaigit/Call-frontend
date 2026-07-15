import { NextResponse } from "next/server";
import {
  bulkDeleteCustomers,
  bulkUpdateStatus,
  createCustomer,
  getAllFilteredCustomers,
  importCustomers,
  queryCustomers,
} from "@/lib/data/customers-repository";
import type {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
} from "@/types/customer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exportAll = searchParams.get("export") === "true";

  const baseParams = {
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") as CustomerStatus | "all") ?? "all",
    tier: (searchParams.get("tier") as CustomerTier | "all") ?? "all",
    source: (searchParams.get("source") as CustomerSource | "all") ?? "all",
    ownerId: searchParams.get("ownerId") ?? "all",
    sortBy: (searchParams.get("sortBy") as "name") ?? "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
  };

  await new Promise((r) => setTimeout(r, 280));

  if (exportAll) {
    return NextResponse.json({
      success: true,
      data: getAllFilteredCustomers(baseParams),
    });
  }

  return NextResponse.json(
    queryCustomers({
      ...baseParams,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    })
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const customer = createCustomer(body);
  return NextResponse.json({ success: true, data: customer }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (body.action === "bulk_delete" && Array.isArray(body.ids)) {
    const count = bulkDeleteCustomers(body.ids);
    return NextResponse.json({ success: true, data: { count } });
  }

  if (body.action === "bulk_status" && Array.isArray(body.ids) && body.status) {
    const count = bulkUpdateStatus(body.ids, body.status);
    return NextResponse.json({ success: true, data: { count } });
  }

  if (body.action === "import" && Array.isArray(body.rows)) {
    const result = importCustomers(body.rows);
    return NextResponse.json({ success: true, data: result });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
