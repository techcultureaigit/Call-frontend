import { proxyToBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyToBackend(request, "providers");
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend(request, "providers", "", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
