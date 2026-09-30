import { createDb, databaseUrl } from "./connection";
import { DEMO_RESUME_ID, DEMO_USER_ID } from "./demo";
import { readExampleResume } from "./example-resume";
import { demoResumes, profiles, user } from "./schema";

async function main() {
  const payload = readExampleResume();
  const { personalInfo } = payload;
  const { sql, db } = createDb(databaseUrl("direct"));
  try {
    await db
      .insert(user)
      .values({
        id: DEMO_USER_ID,
        name: personalInfo.name,
        email: personalInfo.email,
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: personalInfo.name,
          email: personalInfo.email,
          emailVerified: true,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(profiles)
      .values({
        userId: DEMO_USER_ID,
        title: personalInfo.title,
        phone: personalInfo.phone,
        linkedin: personalInfo.linkedin,
        github: personalInfo.github,
        timezone: "UTC",
        locale: "en",
        onboardingState: "complete",
        role: "user",
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          title: personalInfo.title,
          phone: personalInfo.phone,
          linkedin: personalInfo.linkedin,
          github: personalInfo.github,
          onboardingState: "complete",
          updatedAt: new Date(),
          deletedAt: null,
        },
      });

    await db
      .insert(demoResumes)
      .values({
        id: DEMO_RESUME_ID,
        userId: DEMO_USER_ID,
        label: personalInfo.name,
        payload,
      })
      .onConflictDoUpdate({
        target: demoResumes.id,
        set: {
          userId: DEMO_USER_ID,
          label: personalInfo.name,
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
