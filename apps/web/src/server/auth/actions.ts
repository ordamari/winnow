"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "../db/client";
import { profiles } from "../db/schema";
import { auth } from "./auth";
import { createExtensionCode } from "./extension";
import { requireUser } from "./session";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200),
  phone: z.string().trim().max(50),
  linkedin: z.string().trim().max(200),
  github: z.string().trim().max(200),
  timezone: z.string().trim().min(1).max(100),
  locale: z.enum(["en", "he"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;

type ActionResult =
  { ok: true } | { ok: false; error: "invalid" | "failed" | "stale" };

function actionError(error: unknown): ActionResult {
  const code =
    error &&
    typeof error === "object" &&
    "body" in error &&
    error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    typeof error.body.code === "string"
      ? error.body.code
      : "";
  if (code === "SESSION_NOT_FRESH" || code === "SESSION_EXPIRED") {
    return { ok: false, error: "stale" };
  }
  return { ok: false, error: "failed" };
}

export async function saveProfile(
  input: ProfileInput,
  mode: "onboarding" | "settings",
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const current = await requireUser({ allowPending: mode === "onboarding" });
  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { name: parsed.data.name },
    });
    await db
      .update(profiles)
      .set({
        title: parsed.data.title,
        phone: parsed.data.phone,
        linkedin: parsed.data.linkedin,
        github: parsed.data.github,
        timezone: parsed.data.timezone,
        locale: parsed.data.locale,
        onboardingState:
          mode === "onboarding" ? "complete" : current.profile.onboardingState,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, current.profile.id));
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function unlinkConnectedAccount(
  accountId: string,
): Promise<ActionResult> {
  if (!accountId) return { ok: false, error: "invalid" };
  await requireUser();
  try {
    await auth.api.unlinkAccount({
      headers: await headers(),
      body: { accountId },
    });
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function revokeAllSessions(): Promise<ActionResult> {
  await requireUser();
  try {
    await auth.api.revokeSessions({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  await requireUser();
  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: {},
    });
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function issueExtensionCode(): Promise<
  { ok: true; code: string; expiresAt: string } | ActionResult
> {
  try {
    const issued = await createExtensionCode();
    return { ok: true, code: issued.code, expiresAt: issued.expiresAt };
  } catch (error) {
    return actionError(error);
  }
}
