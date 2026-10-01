import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDb, databaseUrl } from "../db/connection";
import { banks, user } from "../db/schema";
import { assertOwner, ownedBy, OwnershipError } from "./ownership";

const databaseReady = Boolean(process.env.DATABASE_URL);

describe("assertOwner", () => {
  it("allows the owner", () => {
    expect(() => assertOwner("user-a", "user-a")).not.toThrow();
  });

  it("rejects another user", () => {
    expect(() => assertOwner("user-b", "user-a")).toThrow(OwnershipError);
  });
});

describe.skipIf(!databaseReady)("ownedBy", () => {
  it("returns only the signed-in user's live rows", async () => {
    const { sql, db } = createDb(databaseUrl("direct"));
    const userA = randomUUID();
    const userB = randomUUID();
    const bankA = randomUUID();
    const bankB = randomUUID();

    try {
      await db.insert(user).values([
        {
          id: userA,
          name: "User A",
          email: `${userA}@ownership.test`,
          emailVerified: true,
        },
        {
          id: userB,
          name: "User B",
          email: `${userB}@ownership.test`,
          emailVerified: true,
        },
      ]);
      await db.insert(banks).values([
        { id: bankA, userId: userA },
        { id: bankB, userId: userB },
      ]);

      const visible = await db
        .select({ id: banks.id })
        .from(banks)
        .where(ownedBy(banks.userId, banks.deletedAt, userA));

      expect(visible.map((row) => row.id)).toEqual([bankA]);
    } finally {
      await db.delete(user).where(eq(user.id, userA));
      await db.delete(user).where(eq(user.id, userB));
      await sql.end();
    }
  });
});
