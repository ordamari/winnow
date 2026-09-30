# T06: Database, ORM & migrations (Postgres + pgvector)

**Phase:** 1 · **Depends on:** T01 · **Size:** S

## Goal

A managed Postgres with `pgvector` enabled from the start, a typed ORM, and a migration workflow.

## Scope

- Provision dev and prod databases (plus a branch/preview DB per PR if the provider supports it).
- Enable `pgvector` extension (used from T24 on; enabling now avoids a later migration surprise).
- ORM + migration tooling, `db:generate`, `db:migrate`, `db:studio`, `db:seed` scripts.
- Server-only DB client with connection pooling suitable for serverless.
- Seed script that loads `resume-data.example.json` for a demo user.
- Conventions: `id` (uuid/cuid), `created_at`/`updated_at`, soft delete policy, `user_id` on every user-owned row.

## Out of scope

Actual domain tables (T08, T12), auth tables (T07).

## Decisions (resolve in Plan mode)

- Provider: Supabase (DB + auth + storage in one) vs. Neon (DB branching) vs. other.
- ORM: Drizzle (SQL-first, great pgvector support) vs. Prisma.
- Row-level security (Supabase RLS) vs. enforcing ownership in the app layer only.
- File storage for PDFs (needed by T13): provider storage vs. S3/R2 vs. Vercel Blob.

## Acceptance criteria

- `db:migrate` runs cleanly on an empty DB; `select extversion from pg_extension where extname='vector'` returns a version.
- Seed creates a demo dataset.
- CI runs migrations against a throwaway DB.

## Decisions log

- **Provider:** Neon for preview and production. The Vercel integration branches a database per preview deployment. Local dev is Docker Compose (`pgvector/pgvector:pg17`). CI uses the same image as a throwaway service. `DATABASE_URL` is the pooled app URL; `DATABASE_URL_UNPOOLED` is the direct URL for migrations. Locally they are the same.
- **ORM:** Drizzle with `postgres` (postgres.js). `prepare: false` for Neon’s pooler, `max: 1` for serverless, singleton in dev.
- **Ownership:** App layer only. Every user-owned table has `user_id`. Live rows have `deleted_at` null. No RLS.
- **IDs:** Postgres `uuid` via `gen_random_uuid()`.
- **Files:** PDFs are not stored. T13 regenerates them from the immutable snapshot (selections and style). A renderer version can live on that row later if a visual change needs explaining.
- **Seed table:** `demo_resumes` holds the example JSON for a fixed demo user. T08 drops it when the normalized bank exists.
