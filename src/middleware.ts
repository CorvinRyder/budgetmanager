// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 1. Get your secret key from environment variables
// It must be converted into a Uint8Array for the Web Crypto API
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-use-a-real-one-in-env"
);

const protectedRoutes = ["/viewtrans", "/admin", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    const token = request.cookies.get("session-token")?.value;

    if (!token) {
      return redirectToLogin(request);
    }

    try {
      // 2. Cryptographically verify the token entirely in-memory
      // This checks the signature and the expiration time ('exp') automatically
      const { payload } = await jwtVerify(token, JWT_SECRET);

      console.debug(payload);

      // Optional: Role-based authorization check using token payload data
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // 3. Optional: Pass user data to down-stream Server Components via headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.sub as string);
      requestHeaders.set("x-user-role", (payload.role as string) || "user");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // If verification fails (token tampered with, expired, or invalid signature)
      console.error("JWT verification failed:", error);
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

// Helper to redirect to login and preserve the destination URL
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/", request.url);
  // loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  const resp = NextResponse.redirect(loginUrl);
  resp.cookies.delete("session-token");
  return resp;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
