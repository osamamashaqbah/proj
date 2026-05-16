import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PREFIX = "/admin";
const EMPLOYEE_PREFIX = "/employee";
const USER_PREFIX = "/dashboard";
const SELL_PREFIX = "/sell";
const PROFILE_PREFIX = "/profile";
const ORDERS_PREFIX = "/orders";
const MY_LISTINGS_PREFIX = "/my-listings";

const PROTECTED_PREFIXES = [
  ADMIN_PREFIX,
  EMPLOYEE_PREFIX,
  USER_PREFIX,
  SELL_PREFIX,
  PROFILE_PREFIX,
  ORDERS_PREFIX,
  MY_LISTINGS_PREFIX,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const roles = (token.roles as string[]) ?? [];
  if (pathname.startsWith(ADMIN_PREFIX) && !roles.includes("ADMIN")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  if (
    pathname.startsWith(EMPLOYEE_PREFIX) &&
    !roles.includes("EMPLOYEE") &&
    !roles.includes("ADMIN")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/dashboard/:path*",
    "/sell/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/my-listings/:path*",
  ],
};
