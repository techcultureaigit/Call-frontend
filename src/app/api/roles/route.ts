import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

/** GET /api/roles → GET /api/v1/roles (Express) */
export async function GET(request: Request) {
  return proxyToBackend(request, "roles");
}

/** POST /api/roles → POST /api/v1/roles */
export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend(request, "roles", "", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
