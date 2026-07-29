import { NextResponse } from "next/server";
import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/${id}/duplicate`, {
    method: "POST",
    headers: apiConfig.headers,
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
