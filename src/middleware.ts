import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-to-Dashboard route mapping
const DASHBOARD_REDIRECTS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  ORGANIZER: "/club/dashboard",
  STUDENT: "/student/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user id and role from session cookies
  const userId = request.cookies.get("campuspulse_user_id")?.value;
  const role = request.cookies.get("campuspulse_role")?.value?.toUpperCase();

  // Root /dashboard multiplexer
  if (pathname === "/dashboard") {
    if (!userId || !role) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/dashboard", request.url));
    }
    const target = DASHBOARD_REDIRECTS[role] || "/student/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Handle /organizer/dashboard legacy alias
  if (pathname === "/organizer/dashboard") {
    return NextResponse.redirect(new URL("/club/dashboard", request.url));
  }

  // 1. Admin Protected Routes: /admin/* and /approvals
  const isAdminRoute = pathname.startsWith("/admin") || pathname === "/approvals";
  if (isAdminRoute) {
    if (!userId || !role) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "ADMIN") {
      const target = DASHBOARD_REDIRECTS[role] || "/student/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 2. Club / Organizer Protected Routes: /club/*, /create, /scanner
  const isClubRoute =
    pathname.startsWith("/club") ||
    pathname === "/create" ||
    pathname.startsWith("/create/") ||
    pathname === "/scanner";

  if (isClubRoute) {
    if (!userId || !role) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // 3. Student Protected Routes: /student/*, /my-tickets
  const isStudentRoute = pathname.startsWith("/student") || pathname === "/my-tickets";
  if (isStudentRoute) {
    if (!userId || !role) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, images, uploads
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
