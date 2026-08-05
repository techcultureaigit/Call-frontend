import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

/** GET /api/users → GET /api/v1/users */
export async function GET(request: Request) {
  return proxyToBackend(request, "users");
}

/** POST /api/users → POST /api/v1/users */
export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend(request, "users", "", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
