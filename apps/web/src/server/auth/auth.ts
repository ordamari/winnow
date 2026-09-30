import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer, magicLink } from "better-auth/plugins";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { eq } from "drizzle-orm";

import { env } from "@/env";

import { db } from "../db/client";
import {
  account,
  demoResumes,
  profiles,
  session,
  user,
  verification,
} from "../db/schema";
import { sendMagicLinkEmail } from "./mailer";

const BUILD_SECRET = "build-time-placeholder-secret-32chars!!";

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

function authSecret() {
  if (env.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (isBuildPhase()) return BUILD_SECRET;
  throw new Error("BETTER_AUTH_SECRET is not set");
}

function authBaseUrl() {
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;
  if (process.env.NODE_ENV !== "production" || isBuildPhase()) {
    return "http://localhost:3000";
  }
  throw new Error("BETTER_AUTH_URL is not set");
}

function socialProviders() {
  const providers: NonNullable<
    Parameters<typeof betterAuth>[0]["socialProviders"]
  > = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }
  return providers;
}

export const auth = betterAuth({
  secret: authSecret(),
  baseURL: authBaseUrl(),
  trustedOrigins: [authBaseUrl()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  account: {
    accountLinking: {
      allowUnlinkingAll: true,
    },
  },
  socialProviders: socialProviders(),
  databaseHooks: {
    user: {
      create: {
        after: async (created) => {
          await db.insert(profiles).values({ userId: created.id });
        },
      },
      delete: {
        before: async (existing) => {
          // T36 expands this purge to storage, traces, and vectors.
          await db
            .delete(demoResumes)
            .where(eq(demoResumes.userId, existing.id));
          await db.delete(profiles).where(eq(profiles.userId, existing.id));
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    oneTimeToken({
      disableClientRequest: true,
      storeToken: "hashed",
      expiresIn: 3,
    }),
    bearer(),
    nextCookies(),
  ],
});
