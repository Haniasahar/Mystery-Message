import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("next-auth.session-token") ? true : false;

  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await import("next-auth/jwt").then((mod) =>
    mod.getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  );
  const isVerified = token?.isVerified === true;
  const username = token?.username as string;
  const isLoggedIn = !!token;

  // console.log("token", token);
  // console.log("isVerified:", isVerified);
  // console.log("pathname:", pathname);
  // console.log("username:", username);
  // console.log("isLoggedIn:", isLoggedIn);

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isLoggedIn && !isVerified && !pathname.startsWith("/verify")) {
    return NextResponse.redirect(new URL(`/verify/${username}`, request.url));
  }

  // if (isLoggedIn && !isVerified) {
  //   if (!pathname.startsWith("/verify")) {
  //     return NextResponse.redirect(
  //       new URL(`/verify/${username}`, request.url)
  //     );
  //   }
  //   return NextResponse.next();
  // }

  if (isLoggedIn && isVerified) {
    if (
      ["/", "/sign-in", "/sign-up"].includes(pathname) ||
      pathname.startsWith("/verify")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/verify/:path*", "/dashboard/:path*"],
};
