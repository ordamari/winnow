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

_Fill in after planning._
