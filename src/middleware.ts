import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Page routes only — staff APIs enforce `auth()` and return JSON 401 (no HTML redirect).
  const isStaffPath = pathname.startsWith("/staff");

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
    /* Explicit list — previous root `middleware.ts` was ignored with `src/app`; keep matchers tight. */
    "/staff",
    "/staff/:path*",
  ],
};
