import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "providers", `/${id}`);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(request, "providers", `/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, "providers", `/${id}`, { method: "DELETE" });
}
