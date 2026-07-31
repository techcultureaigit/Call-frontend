import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../_proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(surveysBackendUrl(`/${id}/unschedule`), {
    method: "POST",
    headers: backendAuthHeaders(request),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
