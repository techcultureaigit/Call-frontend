import { NextResponse } from "next/server";
import { backendAuthHeaders, voicesBackendUrl } from "../_proxy";

/** GET /api/voices/:id → GET /api/v1/voices/:id */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(voicesBackendUrl(`/${id}`), {
    headers: backendAuthHeaders(request),
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
