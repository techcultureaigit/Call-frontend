import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const res = await fetch(
    surveysBackendUrl(`/${id}/results${qs ? `?${qs}` : ""}`),
    {
      headers: backendAuthHeaders(request),
      cache: "no-store",
    }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
