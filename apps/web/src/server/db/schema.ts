import type { ResumeData } from "@winnow/core";
import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { deletedAt, id, timestamps, userId } from "./columns";

/**
 * Temporary seed target so migrate and seed have a table.
 * T08 drops this when the normalized bullet bank lands.
 */
export const demoResumes = pgTable("demo_resumes", {
  id: id(),
  userId: userId(),
  label: text("label").notNull(),
  payload: jsonb("payload").$type<ResumeData>().notNull(),
  ...timestamps(),
  deletedAt: deletedAt(),
});
