import { NextResponse } from "next/server";
import { backendAuthHeaders, voicesBackendUrl } from "./_proxy";

/** GET /api/voices → GET /api/v1/voices */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = qs ? `${voicesBackendUrl()}?${qs}` : voicesBackendUrl();

  const res = await fetch(url, {
    headers: backendAuthHeaders(request),
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
