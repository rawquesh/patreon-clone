import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { isPublicRoute } from "@/config/routes";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = token ? isValidToken(token) : false;

  const userMode = request.cookies.get("userMode")?.value || "user";

  // Redirect unauthenticated users to the root page if trying to access protected routes
  if (!isPublicRoute(request.nextUrl.pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle root page redirects based on authentication status
  if (request.nextUrl.pathname === "/") {
    if (isAuthenticated) {
      if (userMode === "creator") {
        return NextResponse.redirect(new URL("/profile", request.url));
      } else {
        return NextResponse.redirect(new URL("/explore", request.url));
      }
    }
  }

  return NextResponse.next();
}

function isValidToken(token: string): boolean {
  try {
    const decodedToken = jwtDecode<{ exp?: number }>(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp ? decodedToken.exp > currentTime : false;
  } catch {
    return false;
  }
}
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - any path with a file extension (e.g., .svg, .png, .jpg, .js, .css)
  matcher: ["/((?!api|_next/static|_next/image|.*\\..+|favicon.ico).*)"],
};
