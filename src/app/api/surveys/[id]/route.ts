import { NextResponse } from "next/server";
import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/${id}`, {
    headers: apiConfig.headers,
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/${id}`, {
    method: "DELETE",
    headers: apiConfig.headers,
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
