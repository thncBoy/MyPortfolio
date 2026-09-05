import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /login or /api)
  if (pathname.startsWith("/admin")) {
    // Check for Firebase auth session cookie
    const session = request.cookies.get("__session");

    // For client-side Firebase Auth, we rely on the auth state listener in AdminLayout.
    // The proxy adds a header that the layout can check, but primary auth guard is client-side.
    // This is a lightweight server-side check — if no session cookie exists, we still let through
    // because Firebase Auth state is managed client-side. The AdminLayout component handles redirects.
    
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
