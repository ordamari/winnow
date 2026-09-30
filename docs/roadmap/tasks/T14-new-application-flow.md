# T14: "New application" flow

**Phase:** 2 · **Depends on:** T13, T04 · **Size:** M

## Goal

The core loop in one guided flow: **link + JD → tailor → review → save version → mark applied.** This is the moment the user is already in the app right before sending, which is where the dashboard gets its data for free.

## Scope

- Entry points: "New application" button (global, command palette), and a `/new?url=` deep link (used by the extension in T27).
- Step 1, Job: paste URL (normalize, detect source, detect duplicates: "you already applied here on …"), paste JD text, company/title/location (prefilled when detectable from JD text, editable).
- Step 2, Tailor: run AI Tailor (or skip to manual), land in the builder with the job context pinned and match % visible.
- Step 3, Review: page-fit check (T11 if available), name the version.
- Step 4, Save: creates job + resume version + application (status Applied or Saved), downloads the PDF.
- Draft persistence: leaving mid-flow keeps a draft application.
- Quick "log an application I already sent" path (no tailoring, just job + optional existing version).

## Out of scope

Dashboard views (T15), JD requirement extraction (T23; plug in later).

## Decisions (resolve in Plan mode)

- Wizard/stepper vs. builder page with a job side-panel.
- Default status on save (Applied vs. Saved-to-apply-later).
- Duplicate policy (warn vs. block) for same normalized URL.

## Acceptance criteria

- From URL paste to downloaded PDF + tracked application in under a minute.
- Re-opening the application shows the exact version and JD snapshot.
- E2E test for the full flow (with the AI call mocked).

## Decisions log

_Fill in after planning._
