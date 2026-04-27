import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that require authentication
  const isStaffPath = pathname.startsWith("/staff") || pathname.startsWith("/api/staff");
  
  // Public paths under staff or auth
  const isPublicStaffPath = pathname === "/staff/login" || pathname === "/login";

  if (isStaffPath && !isPublicStaffPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/staff/login", req.url);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/intake (public intake API)
     * - api/checkin (public check-in API)
     * - api/health (public health check)
     * - api/uploads (public file serving)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/intake|api/checkin|api/health|api/uploads|_next/static|_next/image|favicon.ico).*)",
  ],
};
