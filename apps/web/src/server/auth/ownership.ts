import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { notDeleted } from "../db/columns";

export class OwnershipError extends Error {
  constructor() {
    super("You cannot access another user's data.");
    this.name = "OwnershipError";
  }
}

export function assertOwner(rowUserId: string, actorId: string) {
  if (rowUserId !== actorId) {
    throw new OwnershipError();
  }
}

export function ownedBy(
  userIdColumn: AnyPgColumn,
  deletedAtColumn: AnyPgColumn,
  actorId: string,
): SQL {
  const clause = and(eq(userIdColumn, actorId), notDeleted(deletedAtColumn));
  if (!clause) {
    throw new Error("ownedBy requires a user and a deleted_at column.");
  }
  return clause;
}
