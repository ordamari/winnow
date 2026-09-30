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

_Fill in after planning._
