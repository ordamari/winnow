import { createSql, databaseUrl } from "./connection";

async function main() {
  const sql = createSql(databaseUrl("direct"));
  try {
    const extensions = await sql`
      select extversion from pg_extension where extname = 'vector'
    `;
    const version = extensions[0]?.extversion;
    if (typeof version !== "string" || version.length === 0) {
      throw new Error(
        "select extversion from pg_extension where extname = 'vector' returned no version",
      );
    }
    console.log(version);

    const counts = await sql`
      select count(*)::int as count from demo_resumes
    `;
    const count = Number(counts[0]?.count);
    if (count !== 1) {
      throw new Error(`expected 1 demo resume, found ${count}`);
    }
    console.log(`demo resumes: ${count}`);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
