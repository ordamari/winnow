import { routing } from "@/i18n/routing";

export const protectedPaths = [
  "/builder",
  "/bank",
  "/applications",
  "/recommendations",
  "/insights",
  "/settings",
  "/design",
  "/onboarding",
] as const;

export function splitLocale(pathname: string): {
  locale: string;
  path: string;
} {
  const [, maybe, ...rest] = pathname.split("/");
  if (maybe && (routing.locales as readonly string[]).includes(maybe)) {
    const joined = rest.join("/");
    return { locale: maybe, path: joined ? `/${joined}` : "/" };
  }
  return { locale: routing.defaultLocale, path: pathname || "/" };
}

export function localePath(locale: string, path: string) {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

export function isProtectedPath(path: string) {
  return (protectedPaths as readonly string[]).includes(path);
}

/** Relative in-app path, or the builder when the value is not one of ours. */
export function safeAppPath(value: string | null | undefined, locale: string) {
  const fallback = localePath(locale, "/builder");
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  const { path } = splitLocale(value);
  if (!isProtectedPath(path)) return fallback;
  return value;
}
