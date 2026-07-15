import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authConfig } from "@/config/api";
import { DEV_AUTH_SESSION } from "@/lib/auth/dev-session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.tokenKey)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await new Promise((r) => setTimeout(r, 80));

  return NextResponse.json({
    success: true,
    data: {
      ...DEV_AUTH_SESSION,
      tokens: {
        ...DEV_AUTH_SESSION.tokens,
        accessToken: token,
      },
    },
  });
}
