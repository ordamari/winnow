# T20: Personal insights & funnel analytics

**Phase:** 2 · **Depends on:** T15 · **Size:** M

## Goal

Answer "why am I not hearing back?" with the user's own data.

## Scope

- `/insights`: funnel (applied → screening → technical → offer) with conversion rates; applications per week; median time to first response; active pipeline.
- Breakdown by: source, channel (referral vs. direct is usually the biggest signal), role title, resume version / bank, AI-tailored vs. manual, JD match % bucket.
- Bullet-level signal: which bullets appear most in versions that reached Screening (feeds T30).
- Callouts: "Referrals convert 4× better for you", "0 responses in 20 applications with version X".
- Date range filter; CSV export.

## Out of scope

Cross-user benchmarks (possible after T29/T30 with privacy review).

## Decisions (resolve in Plan mode)

- Charts library (Recharts / Tremor / visx).
- Computed on the fly (SQL views) vs. materialized nightly.
- Minimum sample sizes before showing a callout (avoid misleading stats).

## Acceptance criteria

- Metrics match hand-calculated values on a seeded dataset.
- Callouts are hidden below the sample-size threshold.

## Decisions log

_Fill in after planning._
