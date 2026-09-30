# T29: Shared job pool (opt-in, dedupe, freshness)

**Phase:** 5 · **Depends on:** T23, T36 · **Size:** M

## Goal

Every job a user adds (link + JD + analysis) can enrich a shared pool that powers recommendations for others, while resumes stay private.

## Scope

- Opt-in per user (default setting) and per job ("don't share this one"). Only job data is shared: URL, JD text, analysis, first-seen date. Never who applied, resumes or statuses.
- Global dedupe: `normalized_url` + near-duplicate JD detection (hash + embedding similarity) → one canonical pool job with `seen_count`.
- **Freshness**: `first_seen`, `last_seen` (bumped whenever anyone adds it), estimated expiry (default ~21 days), "Report closed" button, optional lightweight user-triggered link check (HEAD request on view, not crawling).
- Moderation: spam/abuse flags, admin review queue (T37).
- Pool browse page (basic): search/filter by title, stack, location, freshness.

## Out of scope

Personalized ranking (T31).

## Decisions (resolve in Plan mode)

- Default opt-in vs. opt-out (privacy/legal review with T36).
- Link check policy (on-demand only vs. scheduled for pool jobs) and whether it conflicts with principle #4.
- Expiry heuristics per source.

## Acceptance criteria

- Two users adding the same job produce one pool job.
- A job marked private never appears in the pool (tested).
- Stale jobs are hidden after expiry unless re-seen.

## Decisions log

_Fill in after planning._
