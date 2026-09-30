import "server-only";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

import { db } from "../db/client";
import { notDeleted } from "../db/columns";
import { profiles } from "../db/schema";
import { auth } from "./auth";

export function homePath(onboardingState: string) {
  return onboardingState === "pending" ? "/onboarding" : "/builder";
}

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(
      and(eq(profiles.userId, session.user.id), notDeleted(profiles.deletedAt)),
    )
    .limit(1);

  if (!profile) return null;

  return { session: session.session, user: session.user, profile };
}

export async function requireUser(options?: { allowPending?: boolean }) {
  const current = await getUser();
  const locale = await getLocale();
  if (!current) {
    redirect({ href: "/sign-in", locale });
    throw new Error("Redirect failed");
  }
  if (!options?.allowPending && current.profile.onboardingState === "pending") {
    redirect({ href: "/onboarding", locale });
    throw new Error("Redirect failed");
  }
  return current;
}
