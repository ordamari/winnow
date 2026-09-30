# T31: Recommendation engine (semantic → success-weighted)

**Phase:** 5 · **Depends on:** T29, T30 · **Size:** L

## Goal

"Apply here, it fits you, and here's the version to send." The moat of the product.

## Scope

- **v1, semantic match:** for each fresh pool job, score candidates by requirement coverage against their bank (reuse T24 coverage matrix), weighting must-haves, seniority fit, location/work-mode prefs.
- **v2, success-weighted re-ranking (your core idea):** find past _successful_ signals whose job vectors are similar to the new job; if the candidate's profile/bullets are similar to what succeeded there, boost the score. Explain it: "Profiles like yours got interviews at 6 similar roles."
- Cold-start handling: v1 alone until enough signals exist; show confidence level.
- Candidate preferences: target titles, locations, remote, salary floor, excluded companies (e.g. current employer).
- Exclude jobs already applied to / dismissed.
- Pre-computed daily + on new job insert (background), results in `recommendations` table with score breakdown.
- Offline evaluation: hold out recent successes and measure whether the engine would have ranked them highly (recall@K).
- Each recommendation carries a pre-computed tailor suggestion (lazy, on click, to save cost).

## Out of scope

UI and notifications (T32).

## Decisions (resolve in Plan mode)

- Scoring formula and weights (start simple and tunable).
- Pure SQL/pgvector scoring vs. an LLM re-rank of the top N (cost vs. quality).
- LangGraph pipeline vs. plain background job.

## Acceptance criteria

- Offline recall@10 measured and recorded; v2 ≥ v1.
- Every recommendation has a human-readable explanation grounded in data.

## Decisions log

_Fill in after planning._
