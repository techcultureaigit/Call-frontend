import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/roles/:id → GET /api/v1/roles/:id */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "roles", `/${id}`);
}

/** PATCH /api/roles/:id → PUT /api/v1/roles/:id (Express uses PUT) */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(request, "roles", `/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

/** DELETE /api/roles/:id → DELETE /api/v1/roles/:id */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "roles", `/${id}`, { method: "DELETE" });
}
