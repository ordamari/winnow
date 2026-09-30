import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { auth } from "./auth";
import { requireUser } from "./session";

const EXTENSION_SESSION_MS = 60 * 60 * 1000;
const CODE_TTL_MS = 3 * 60 * 1000;

export function hashOneTimeToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export async function createExtensionCode() {
  const current = await requireUser();
  const ctx = await auth.$context;
  const code = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await ctx.internalAdapter.createVerificationValue({
    value: current.session.token,
    identifier: `one-time-token:${hashOneTimeToken(code)}`,
    expiresAt,
  });
  return { code, expiresAt: expiresAt.toISOString() };
}

export async function exchangeExtensionCode(code: string) {
  const ctx = await auth.$context;
  const verification = await ctx.internalAdapter.consumeVerificationValue(
    `one-time-token:${hashOneTimeToken(code)}`,
  );
  if (!verification || typeof verification.value !== "string") return null;

  const browserSession = await ctx.internalAdapter.findSession(
    verification.value,
  );
  if (!browserSession) return null;
  if (new Date(browserSession.session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const expiresAt = new Date(Date.now() + EXTENSION_SESSION_MS);
  const created = await ctx.internalAdapter.createSession(
    browserSession.user.id,
    false,
    { expiresAt },
    true,
  );
  if (!created || typeof created.token !== "string") return null;

  return {
    token: created.token,
    expiresAt: new Date(created.expiresAt).toISOString(),
  };
}
