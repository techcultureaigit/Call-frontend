import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../../_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const { id, resultId } = await params;
  const res = await fetch(
    surveysBackendUrl(`/${id}/results/${resultId}`),
    {
      headers: backendAuthHeaders(request),
      cache: "no-store",
    }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
