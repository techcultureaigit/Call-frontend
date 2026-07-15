import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/config/api";
import { routePaths } from "@/config/navigation";

const publicRoutes: ReadonlySet<string> = new Set([
  routePaths.auth.login,
  routePaths.auth.forgotPassword,
  routePaths.auth.resetPassword,
]);

const authRoutes: ReadonlySet<string> = new Set([
  routePaths.auth.login,
  routePaths.auth.forgotPassword,
  routePaths.auth.resetPassword,
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authConfig.tokenKey)?.value;
  const isAuthenticated = Boolean(token);
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthRoute = authRoutes.has(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(routePaths.auth.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(
      new URL(authConfig.defaultRedirect, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
