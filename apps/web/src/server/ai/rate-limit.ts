import "server-only";

/**
 * Placeholder per-IP limit until T33. In-memory only: it resets when the
 * process restarts and is not shared across instances.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const MAX_IMPORT_REQUESTS = 4;

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();
const importBuckets = new Map<string, Bucket>();

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
  return takeSlot(buckets, ip, MAX_REQUESTS, now);
}

export function takeResumeImportSlot(ip: string, now = Date.now()): boolean {
  return takeSlot(importBuckets, ip, MAX_IMPORT_REQUESTS, now);
}

function takeSlot(
  slots: Map<string, Bucket>,
  ip: string,
  max: number,
  now: number,
): boolean {
  for (const [key, bucket] of slots) {
    if (now - bucket.windowStart >= WINDOW_MS) slots.delete(key);
  }

  const existing = slots.get(ip);
  if (!existing) {
    slots.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}
