import { isNull, type SQL } from "drizzle-orm";
import { type AnyPgColumn, timestamp, uuid } from "drizzle-orm/pg-core";

/** Postgres uuid primary key (`gen_random_uuid()`). */
export function id() {
  return uuid("id").primaryKey().defaultRandom();
}

/** Present on every user-owned table. No foreign key until T07 adds users. */
export function userId() {
  return uuid("user_id").notNull();
}

export function timestamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}

/**
 * Soft delete: null means the row is live. App-layer reads of user-owned
 * data also filter by `user_id`. Rows are not hard-deleted by default.
 */
export function deletedAt() {
  return timestamp("deleted_at", { withTimezone: true });
}

export function notDeleted(column: AnyPgColumn): SQL {
  return isNull(column);
}
