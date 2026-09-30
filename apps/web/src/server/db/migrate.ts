import { migrate } from "drizzle-orm/postgres-js/migrator";

import { createDb, databaseUrl } from "./connection";

async function main() {
  const { sql, db } = createDb(databaseUrl("direct"));
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    await migrate(db, { migrationsFolder: "drizzle" });
    const rows = await sql`
      select extversion from pg_extension where extname = 'vector'
    `;
    const version = rows[0]?.extversion;
    if (typeof version !== "string" || version.length === 0) {
      throw new Error(
        "select extversion from pg_extension where extname = 'vector' returned no version",
      );
    }
    console.log(`pgvector ${version}`);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
