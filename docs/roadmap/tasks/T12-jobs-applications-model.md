# T12: Jobs & applications data model

**Phase:** 2 · **Depends on:** T08 · **Size:** S

## Goal

The schema at the heart of the CRM and, later, the community pool and recommendation engine. Get it right once.

## Scope

- `jobs`: `url`, `normalized_url` (strip tracking params, canonical host), `source` (LinkedIn, Comeet, Greenhouse, Lever, Workday, other; derived from host), `company`, `title`, `location`, `work_mode`, `jd_text` (snapshot as pasted), `jd_hash`, `created_by`, `visibility` (private / shared, used by T29), timestamps.
- `applications`: `user_id`, `job_id`, `resume_version_id` (T13), `status`, `applied_at`, `channel` (direct / referral / recruiter / agency), `referrer`, `salary_expectation`, `notes`, `next_action_at`, `archived`.
- `application_events`: append-only status history (`from_status`, `to_status`, `at`, `note`). This powers timelines (T16), reminders (T18), analytics (T20) and success signals (T30).
- `contacts` (recruiter / hiring manager, linked to applications).
- Status enum/pipeline: Saved → Applied → Screening → Technical → Home assignment → Final → Offer → Accepted, plus terminal Rejected / Ghosted / Withdrawn. Store as configurable stages so users can rename.
- URL normalization utility with tests per known job site.

## Out of scope

UI (T14–T16), extracted requirements (T23).

## Decisions (resolve in Plan mode)

- One `jobs` row per user (private copy) vs. a global job row + per-user application. A global row makes T29 dedupe natural; privacy then needs the `visibility` flag.
- Fixed vs. user-customizable stages.
- What counts as a "success" stage for T30 (proposed: reached Screening or later).

## Acceptance criteria

- Migrations + zod schemas + typed repository functions with ownership checks.
- URL normalization tests cover LinkedIn, Comeet, Greenhouse, Lever, Workday sample URLs.

## Decisions log

_Fill in after planning._
