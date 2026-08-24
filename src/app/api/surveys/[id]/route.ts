import { NextResponse } from "next/server";
import {
  backendAuthHeaders,
  proxyJsonResponse,
  surveysBackendUrl,
} from "../_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(surveysBackendUrl(`/${id}`), {
      headers: backendAuthHeaders(request),
      cache: "no-store",
    });
    return proxyJsonResponse(res);
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Cannot reach CRM backend.",
      },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(surveysBackendUrl(`/${id}`), {
      method: "DELETE",
      headers: backendAuthHeaders(request),
    });
    return proxyJsonResponse(res);
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Cannot reach CRM backend.",
      },
      { status: 502 }
    );
  }
}
