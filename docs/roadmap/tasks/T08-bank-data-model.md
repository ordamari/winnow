# T08: Bullet bank data model & JSON import

**Phase:** 1 · **Depends on:** T06, T07 · **Size:** M

## Goal

Persist each user's master resume ("bullet bank") in the DB and make the builder read/write it instead of the local JSON.

## Context

Current schema (`src/types/resume.ts`): `personalInfo`, `summary: VersionedText`, `skills[]` (+ `defaultCategoryId`), `skillCategories[]`, `experience[]` (company, title, `alternativeTitles`, period, `bullets: VersionedText[]`), `technicalHighlights: VersionedText[]`, `education`. A `VersionedText` is a slot with `versions[]` (`id`, `label`, `text`, `defaultSelected`).

## Scope

- Tables (normalized): `banks` (a user may have several, e.g. "Frontend", "Fullstack"), `experiences`, `slots` (kind: summary / bullet / highlight; owner experience nullable), `slot_versions`, `skills`, `skill_categories`, `education` (make it a list, not a single object), `personal_info`.
- Stable IDs preserved on import so AI outputs and saved versions (T13) keep referencing the same slot/version IDs.
- Ordering columns (`position`) for drag reorder in T09.
- Import: upload/paste `resume-data.json` → zod validate → preview → write. Export back to the same JSON format.
- Repository/service layer returning the existing `ResumeData` shape so the builder and `buildTailorCatalog` keep working unchanged.
- Builder loads the user's active bank; selection state still in memory (saved in T13).
- Update the `resume-data` Cursor skill or retire it.

## Out of scope

Editing UI (T09), embeddings (T24).

## Decisions (resolve in Plan mode)

- Fully normalized tables vs. a JSONB document per bank (+ normalized only where queried). Normalized makes embeddings, diffs and analytics easier.
- Multiple banks per user now or later.
- Education as list; add optional sections (projects, certifications, languages)?

## Acceptance criteria

- Importing the example JSON and exporting it back round-trips losslessly.
- Builder output for an imported bank equals the Vite app output for the same JSON.
- All queries scoped by `user_id` (tests).

## Decisions log

- **Storage:** Fully normalized tables. One live bank per user. Postgres uuid primary keys. JSON string ids are stored as `public_id` and stay the ids the builder, selections, and tailor catalog use.
- **One bank.** Fullstack vs backend wording stays as versions of the same bullet. No bank switcher.
- **Sections:** Experience, education, highlights, courses, volunteer, and side projects are `entries` sections with one entry shape. `period` is optional. Summary and skills stay their own payloads and are ordered sections (`kind: summary | skills`) so the PDF can place them. Default order is Summary, Work Experience, Skills, Technical Highlights, Education.
- **JSON:** Canonical `sections` array. Import still accepts a legacy file (`experience`, an education object or array, `technicalHighlights`). Export writes the canonical shape. A highlight slot uses the entry id, so existing selection ids stay stable.
- **Ownership:** `requireUser()` on the builder and bank pages. Every read and write uses `ownedBy()`. `banks.user_id` references `user.id` and cascades on account deletion. The demo user is only the seed fixture.
- **`demo_resumes`:** Dropped. Account deletion no longer deletes that table; the bank cascade covers it.
- **Skill:** The Vite `resume-data` skill stays with that app. In Winnow the zod schema is the JSON contract and the database is the source of truth.
