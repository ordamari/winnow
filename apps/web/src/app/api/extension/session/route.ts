import { NextResponse } from "next/server";
import { z } from "zod";

import { clientIp } from "@/server/ai/rate-limit";
import { exchangeExtensionCode } from "@/server/auth/extension";

const bodySchema = z.object({
  code: z.string().min(1).max(200),
});

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();

function takeSlot(ip: string, now = Date.now()) {
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

export async function POST(request: Request) {
  if (!takeSlot(clientIp(request.headers))) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  const session = await exchangeExtensionCode(parsed.data.code);
  if (!session) {
    return NextResponse.json({ error: "invalid-code" }, { status: 400 });
  }

  return NextResponse.json(session);
}
