# T30: Candidate profile vectors & success signals

**Phase:** 5 · **Depends on:** T24, T12 · **Size:** M

## Goal

Build the two inputs the recommendation engine needs: *what each candidate can prove* and *what has worked before*.

## Scope

- **Profile representation** per bank: aggregated vectors (overall + per strength cluster, e.g. "frontend performance", "AI integrations") derived from bullet embeddings; seniority and years estimate; primary stack. Recomputed on bank changes.
- **Success signals (positive only, principle #6)**: when an application reaches a success stage (per T12 decision, e.g. Screening+), store a signal: `(job analysis vector, requirements, resume version's selected bullet vectors, stage reached, date)`.
- Signal weighting: later stages weigh more (Offer > Technical > Screening); referral-channel successes weighted lower (success not driven by the resume).
- Privacy: signals are used in aggregate/vector form for matching; no resume text is exposed to other users.
- Backfill from existing applications.

## Out of scope

Ranking and UI (T31/T32).

## Decisions (resolve in Plan mode)

- Profile vector strategy (mean pooling vs. multiple centroid vectors vs. LLM-written profile summary that is then embedded; the summary is internal and never printed, so principle #1 holds).
- Success stage threshold and weights.

## Acceptance criteria

- Every bank has an up-to-date profile representation.
- Moving an application to Screening creates exactly one signal; referral flag respected.

## Decisions log

_Fill in after planning._
