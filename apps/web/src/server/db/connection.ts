import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export function databaseUrl(kind: "pooled" | "direct" = "pooled") {
  const pooled = process.env.DATABASE_URL;
  const direct = process.env.DATABASE_URL_UNPOOLED ?? pooled;
  const url = kind === "direct" ? direct : (pooled ?? direct);
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy apps/web/.env.example to apps/web/.env.",
    );
  }
  return url;
}

/**
 * `prepare: false` is required by Neon’s transaction pooler.
 * `max: 1` keeps a serverless instance to a single connection.
 */
export function createSql(url: string): Sql {
  return postgres(url, { max: 1, prepare: false });
}

export function createDb(url: string): { sql: Sql; db: Database } {
  const sql = createSql(url);
  return { sql, db: drizzle(sql, { schema }) };
}
