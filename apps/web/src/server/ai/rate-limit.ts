import "server-only";

/**
 * Placeholder per-IP limit until T33. In-memory only: it resets when the
 * process restarts and is not shared across instances.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "local";
}

export function takeTailorSlot(ip: string, now = Date.now()): boolean {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key);
  }

  const existing = buckets.get(ip);
  if (!existing) {
    buckets.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (existing.count >= MAX_REQUESTS) return false;
  existing.count += 1;
  return true;
}
