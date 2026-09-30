import { tailorRequestError, tailorRequestSchema } from "@winnow/core";
import { NextResponse } from "next/server";
import { APIUserAbortError } from "openai";

import { clientIp, takeTailorSlot } from "@/server/ai/rate-limit";
import { TailorError, tailorResume } from "@/server/ai/tailor";
import { getUser } from "@/server/auth/session";

const TAILOR_BODY_MAX_BYTES = 400 * 1024;

function errorJson(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const current = await getUser();
  if (!current) return errorJson("unauthorized", 401);

  if (!takeTailorSlot(clientIp(request.headers))) {
    return errorJson("rate-limited", 429);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > TAILOR_BODY_MAX_BYTES) {
    return errorJson("too-large", 413);
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > TAILOR_BODY_MAX_BYTES) {
    return errorJson("too-large", 413);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return errorJson("invalid-input", 400);
  }

  const parsed = tailorRequestSchema.safeParse(json);
  if (!parsed.success) {
    const code = tailorRequestError(parsed.error);
    return errorJson(code, code === "too-large" ? 413 : 400);
  }

  try {
    const result = await tailorResume({
      ...parsed.data,
      signal: request.signal,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (request.signal.aborted || error instanceof APIUserAbortError) {
      return new NextResponse(null, { status: 499 });
    }
    if (error instanceof TailorError) {
      const status =
        error.code === "no-result"
          ? 502
          : error.code === "empty-jd"
            ? 400
            : 500;
      return errorJson(error.code, status);
    }
    return errorJson("unknown", 500);
  }
}
