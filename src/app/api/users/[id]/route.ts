import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/users/:id → GET /api/v1/users/:id */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "users", `/${id}`);
}

/**
 * PATCH /api/users/:id
 * - { status | isActive } → PATCH /api/v1/users/:id/status
 * - otherwise → PUT /api/v1/users/:id
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const raw = await request.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const keys = Object.keys(body);
  const isStatusOnly =
    keys.length > 0 &&
    keys.every((k) => k === "status" || k === "isActive");

  if (isStatusOnly) {
    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : body.status === "active" || body.status === "invited";
    return proxyToBackend(request, "users", `/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  }

  return proxyToBackend(request, "users", `/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: raw,
  });
}

/** DELETE /api/users/:id → DELETE /api/v1/users/:id */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "users", `/${id}`, { method: "DELETE" });
}
