import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "../../../_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const res = await fetch(
    surveysBackendUrl(`/${id}/results/export${qs ? `?${qs}` : ""}`),
    {
      headers: backendAuthHeaders(request),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const json = await res.json().catch(() => ({
      message: "Failed to export survey results",
    }));
    return NextResponse.json(json, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  const headers = new Headers();
  const contentType =
    res.headers.get("Content-Type") ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const disposition =
    res.headers.get("Content-Disposition") ||
    'attachment; filename="survey-results.xlsx"';

  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", disposition);
  headers.set("Cache-Control", "no-store");

  return new NextResponse(buffer, { status: 200, headers });
}
