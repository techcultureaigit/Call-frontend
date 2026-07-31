import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../_proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(surveysBackendUrl(`/${id}/schedule`), {
    method: "POST",
    headers: {
      ...backendAuthHeaders(request),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
