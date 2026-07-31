import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(surveysBackendUrl(`/${id}`), {
    headers: backendAuthHeaders(request),
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(surveysBackendUrl(`/${id}`), {
    method: "DELETE",
    headers: backendAuthHeaders(request),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
