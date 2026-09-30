import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDb, databaseUrl } from "../db/connection";
import { readExampleResume } from "../db/example-resume";
import { demoResumes, user } from "../db/schema";
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
    const resumeA = randomUUID();
    const resumeB = randomUUID();
    const payload = readExampleResume();

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
      await db.insert(demoResumes).values([
        {
          id: resumeA,
          userId: userA,
          label: "A",
          payload,
        },
        {
          id: resumeB,
          userId: userB,
          label: "B",
          payload,
        },
      ]);

      const visible = await db
        .select({ id: demoResumes.id })
        .from(demoResumes)
        .where(ownedBy(demoResumes.userId, demoResumes.deletedAt, userA));

      expect(visible.map((row) => row.id)).toEqual([resumeA]);
    } finally {
      await db.delete(demoResumes).where(eq(demoResumes.id, resumeA));
      await db.delete(demoResumes).where(eq(demoResumes.id, resumeB));
      await db.delete(user).where(eq(user.id, userA));
      await db.delete(user).where(eq(user.id, userB));
      await sql.end();
    }
  });
});
