import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../_proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const res = await fetch(surveysBackendUrl(`/${id}/contact-file`), {
    method: "POST",
    headers: backendAuthHeaders(request),
    body: formData,
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
