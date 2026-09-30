import "server-only";

import type { Sql } from "postgres";

import { createDb, type Database, databaseUrl } from "./connection";

const globalForDb = globalThis as unknown as {
  sql?: Sql;
  db?: Database;
};

function getDb(): Database {
  if (!globalForDb.db) {
    const created = createDb(databaseUrl("pooled"));
    globalForDb.sql = created.sql;
    globalForDb.db = created.db;
  }
  return globalForDb.db;
}

/** Opens the pool on first use so importing this module does not require a database. */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value: unknown = Reflect.get(real, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});
