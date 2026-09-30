import type { ResumeData } from "@winnow/core";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { deletedAt, id, timestamps, userId } from "./columns";

/**
 * Better Auth tables. Property names stay camelCase for the adapter.
 * SQL names stay snake_case. One-time codes live in `verification`
 * (`one-time-token:<hash>`), which is the table the plugin uses.
 */
export const user = pgTable("user", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps(),
});

export const session = pgTable(
  "session",
  {
    id: id(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ...timestamps(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const profiles = pgTable(
  "profiles",
  {
    id: id(),
    userId: userId()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    phone: text("phone").notNull().default(""),
    linkedin: text("linkedin").notNull().default(""),
    github: text("github").notNull().default(""),
    timezone: text("timezone").notNull().default("UTC"),
    locale: text("locale").notNull().default("en"),
    onboardingState: text("onboarding_state").notNull().default("pending"),
    role: text("role").notNull().default("user"),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    check("profiles_locale_check", sql`${table.locale} in ('en', 'he')`),
    check(
      "profiles_onboarding_state_check",
      sql`${table.onboardingState} in ('pending', 'complete')`,
    ),
    check("profiles_role_check", sql`${table.role} in ('user', 'admin')`),
  ],
);

/**
 * Temporary seed target so migrate and seed have a table.
 * T08 drops this when the normalized bullet bank lands.
 */
export const demoResumes = pgTable("demo_resumes", {
  id: id(),
  userId: userId().references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  payload: jsonb("payload").$type<ResumeData>().notNull(),
  ...timestamps(),
  deletedAt: deletedAt(),
});
