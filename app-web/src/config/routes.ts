/**
 * Centralized route configuration for the Next.js middleware.
 * Public routes are accessible without authentication.
 * All other routes redirect unauthenticated users to the home page.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/support",
  "/tos",
  "/privacy-policy",
  "/community",
  "/community-guidelines",
  "/download",
] as const;

/**
 * Route prefixes that are always public (any sub-path is public).
 */
export const PUBLIC_ROUTE_PREFIXES = [
  "/auth",
  "/creator",
  "/post",
] as const;

/**
 * Check whether a given pathname is a public route.
 */
export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }
  return PUBLIC_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}
