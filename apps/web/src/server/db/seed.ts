import { createDb, databaseUrl } from "./connection";
import { DEMO_RESUME_ID, DEMO_USER_ID } from "./demo";
import { readExampleResume } from "./example-resume";
import { demoResumes } from "./schema";

async function main() {
  const payload = readExampleResume();
  const { sql, db } = createDb(databaseUrl("direct"));
  try {
    await db
      .insert(demoResumes)
      .values({
        id: DEMO_RESUME_ID,
        userId: DEMO_USER_ID,
        label: payload.personalInfo.name,
        payload,
      })
      .onConflictDoUpdate({
        target: demoResumes.id,
        set: {
          userId: DEMO_USER_ID,
          label: payload.personalInfo.name,
          payload,
          updatedAt: new Date(),
          deletedAt: null,
        },
      });
    console.log(`seeded demo resume for user ${DEMO_USER_ID}`);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
