import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
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

export const banks = pgTable(
  "banks",
  {
    id: id(),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("banks_one_live_per_user")
      .on(table.userId)
      .where(sql`${table.deletedAt} is null`),
    index("banks_user_id_idx").on(table.userId),
  ],
);

export const personalInfo = pgTable(
  "personal_info",
  {
    id: id(),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    title: text("title").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    linkedin: text("linkedin").notNull(),
    github: text("github").notNull(),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("personal_info_one_live_bank")
      .on(table.bankId)
      .where(sql`${table.deletedAt} is null`),
    index("personal_info_user_id_idx").on(table.userId),
  ],
);

export const sections = pgTable(
  "sections",
  {
    id: id(),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    check(
      "sections_kind_check",
      sql`${table.kind} in ('summary', 'skills', 'entries')`,
    ),
    uniqueIndex("sections_bank_public_id_live")
      .on(table.bankId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("sections_one_live_summary")
      .on(table.bankId)
      .where(sql`${table.kind} = 'summary' and ${table.deletedAt} is null`),
    uniqueIndex("sections_one_live_skills")
      .on(table.bankId)
      .where(sql`${table.kind} = 'skills' and ${table.deletedAt} is null`),
    index("sections_user_id_idx").on(table.userId),
  ],
);

export const sectionEntries = pgTable(
  "section_entries",
  {
    id: id(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    position: integer("position").notNull(),
    organization: text("organization"),
    title: text("title"),
    alternativeTitles: text("alternative_titles")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    period: text("period"),
    url: text("url"),
    defaultChecked: boolean("default_checked").notNull().default(false),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("section_entries_bank_public_id_live")
      .on(table.bankId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    index("section_entries_user_id_idx").on(table.userId),
  ],
);

export const slots = pgTable(
  "slots",
  {
    id: id(),
    sectionId: uuid("section_id").references(() => sections.id, {
      onDelete: "cascade",
    }),
    entryId: uuid("entry_id").references(() => sectionEntries.id, {
      onDelete: "cascade",
    }),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    position: integer("position").notNull(),
    defaultChecked: boolean("default_checked").notNull().default(false),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    check(
      "slots_one_owner_check",
      sql`(${table.sectionId} is not null and ${table.entryId} is null) or (${table.sectionId} is null and ${table.entryId} is not null)`,
    ),
    uniqueIndex("slots_bank_public_id_live")
      .on(table.bankId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    index("slots_user_id_idx").on(table.userId),
  ],
);

export const slotVersions = pgTable(
  "slot_versions",
  {
    id: id(),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "cascade" }),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    label: text("label").notNull(),
    text: text("text").notNull(),
    defaultSelected: boolean("default_selected").notNull().default(false),
    position: integer("position").notNull(),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("slot_versions_slot_public_id_live")
      .on(table.slotId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    index("slot_versions_user_id_idx").on(table.userId),
  ],
);

export const skillCategories = pgTable(
  "skill_categories",
  {
    id: id(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    label: text("label").notNull(),
    position: integer("position").notNull(),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("skill_categories_bank_public_id_live")
      .on(table.bankId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    index("skill_categories_user_id_idx").on(table.userId),
  ],
);

export const skills = pgTable(
  "skills",
  {
    id: id(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => skillCategories.id, {
      onDelete: "set null",
    }),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    userId: userId().references(() => user.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    name: text("name").notNull(),
    defaultChecked: boolean("default_checked").notNull().default(false),
    position: integer("position").notNull(),
    ...timestamps(),
    deletedAt: deletedAt(),
  },
  (table) => [
    uniqueIndex("skills_bank_public_id_live")
      .on(table.bankId, table.publicId)
      .where(sql`${table.deletedAt} is null`),
    index("skills_user_id_idx").on(table.userId),
  ],
);
