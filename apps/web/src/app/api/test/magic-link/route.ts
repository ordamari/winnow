import { NextResponse } from "next/server";

import { readMagicLink } from "@/server/auth/magic-link-outbox";

export async function GET(request: Request) {
  if (process.env.E2E_TEST !== "1") {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const email = new URL(request.url).searchParams.get("email");
  const url = email ? readMagicLink(email) : undefined;
  if (!url) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  return NextResponse.json({ url });
}
