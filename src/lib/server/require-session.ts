import { authConfig } from "@/config/api";
import { NextRequest, NextResponse } from "next/server";

/** Block anonymous file access. Browser <a> / <audio> still send the auth cookie. */
export function unauthorizedIfNoSession(request: NextRequest): NextResponse | null {
  const header = request.headers.get("authorization");
  const bearer =
    header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  const token = request.cookies.get(authConfig.tokenKey)?.value || bearer;
  if (token) return null;
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}
