// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("auth")?.value === "1";
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isPublicPath = ["/login", "/favicon.ico", "/_next", "/api"].some(
    (path) => request.nextUrl.pathname.startsWith(path)
  );

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
