import { randomUUID } from "node:crypto";

import { exportResumeData, parseResumeData } from "@winnow/core";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { createDb, databaseUrl } from "../db/connection";
import { readExampleResume } from "../db/example-resume";
import { user } from "../db/schema";
import { loadBankForUser, replaceBankForUser } from "./store";

const databaseReady = Boolean(process.env.DATABASE_URL);

function resume(name: string, organization: string) {
  return parseResumeData({
    personalInfo: {
      name,
      title: "Developer",
      phone: "",
      email: `${name}@example.com`,
      linkedin: "",
      github: "",
    },
    summary: {
      id: "summary",
      versions: [
        {
          id: "default",
          label: "Default",
          text: name,
          defaultSelected: true,
        },
      ],
    },
    skills: [],
    skillCategories: [],
    experience: [
      {
        id: "job",
        company: organization,
        title: "Developer",
        alternativeTitles: [],
        period: "JAN 2020 - PRESENT",
        bullets: [
          {
            id: "bullet",
            defaultChecked: true,
            versions: [
              {
                id: "bullet-default",
                label: "Default",
                text: organization,
                defaultSelected: true,
              },
            ],
          },
        ],
      },
    ],
    technicalHighlights: [
      {
        id: "highlight",
        defaultChecked: true,
        versions: [
          {
            id: "highlight-default",
            label: "Default",
            text: "No date",
            defaultSelected: true,
          },
        ],
      },
    ],
  });
}

describe.skipIf(!databaseReady)("bank store", () => {
  it("loads only the signed-in user's bank", async () => {
    const { sql, db } = createDb(databaseUrl("direct"));
    const userA = randomUUID();
    const userB = randomUUID();

    try {
      await db.insert(user).values([
        {
          id: userA,
          name: "User A",
          email: `${userA}@bank.test`,
          emailVerified: true,
        },
        {
          id: userB,
          name: "User B",
          email: `${userB}@bank.test`,
          emailVerified: true,
        },
      ]);
      await replaceBankForUser(db, userA, resume("Ada", "Alpha Co"));
      await replaceBankForUser(db, userB, resume("Bea", "Beta Co"));

      const visible = await loadBankForUser(db, userA);
      expect(visible?.personalInfo.name).toBe("Ada");
      const jobs = visible?.sections.find(
        (section) => section.kind === "entries" && section.id === "experience",
      );
      expect(jobs?.kind).toBe("entries");
      if (jobs?.kind === "entries") {
        expect(jobs.entries[0]?.organization).toBe("Alpha Co");
      }
      expect(JSON.stringify(visible)).not.toContain("Beta Co");
    } finally {
      await db.delete(user).where(eq(user.id, userA));
      await db.delete(user).where(eq(user.id, userB));
      await sql.end();
    }
  });

  it("round-trips the example resume through the database", async () => {
    const { sql, db } = createDb(databaseUrl("direct"));
    const userId = randomUUID();
    const example = readExampleResume();

    try {
      await db.insert(user).values({
        id: userId,
        name: "Example",
        email: `${userId}@bank.test`,
        emailVerified: true,
      });
      await replaceBankForUser(db, userId, example);
      const loaded = await loadBankForUser(db, userId);
      expect(loaded).toEqual(exportResumeData(example));
    } finally {
      await db.delete(user).where(eq(user.id, userId));
      await sql.end();
    }
  });
});
