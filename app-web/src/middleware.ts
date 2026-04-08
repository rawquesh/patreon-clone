import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = token ? isValidToken(token) : false;

  const userMode = request.cookies.get("userMode")?.value || "user";

  // All routes are protected except for the root page and auth pages
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/about" ||
    request.nextUrl.pathname === "/pricing" ||
    request.nextUrl.pathname === "/support" ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/creator") ||
    request.nextUrl.pathname.startsWith("/tos") ||
    request.nextUrl.pathname.startsWith("/privacy-policy") ||
    request.nextUrl.pathname.startsWith("/community") ||
    request.nextUrl.pathname.startsWith("/download") ||
    request.nextUrl.pathname.startsWith("/post");

  // Redirect unauthenticated users to the root page if trying to access protected routes
  if (!isPublicRoute && !isAuthenticated) {
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
