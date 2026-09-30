import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { isProtectedPath, localePath, splitLocale } from "@/lib/app-paths";

import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { locale, path } = splitLocale(request.nextUrl.pathname);
  if (isProtectedPath(path) && !getSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, "/sign-in");
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return handleI18n(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)",
};
