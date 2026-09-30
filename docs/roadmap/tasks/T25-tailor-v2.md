# T25: Tailor v2: retrieval + LLM ranking

**Phase:** 3 · **Depends on:** T22, T24 · **Size:** L

## Goal

A measurably better tailor: grounded in the structured JD analysis and semantic retrieval, explaining _which requirement_ each selected bullet covers, still selecting only from the bank.

## Scope

- Pipeline (a natural fit for a LangGraph graph or explicit steps):
  1. Load/compute JD analysis (T23).
  2. Retrieve candidate bullets/versions per requirement via vectors (T24).
  3. LLM ranks and selects under one-page budgets, choosing versions, titles, skills and highlights, and maps each chosen item to the requirement(s) it evidences.
  4. Deterministic validation (existing sanitizer rules + ID whitelist + budgets).
- Output extends `TailorResult` with `coverage: { requirementId, bulletIds[], strength }[]`.
- UI: requirement checklist next to the builder ("GraphQL ✓ covered by bullet X"), match % per bullet as today.
- Streaming progress through the steps.
- A/B against v1 using the T22 eval harness; ship only if metrics improve.
- Optional later: few-shot examples retrieved from the user's own past successful versions for similar jobs.

## Out of scope

Missing-requirement UX (T26).

## Decisions (resolve in Plan mode)

- LangGraph vs. plain orchestrated functions.
- Retrieval as a hard pre-filter vs. a hint (the whole bank still fits in context for most users, so retrieval may be better used for _coverage mapping_ than pruning).
- Model choice per step.

## Acceptance criteria

- Eval metrics beat v1 baseline (recorded in the decisions log).
- Invalid-ID rate stays 0 after sanitization; no invented text possible by construction.

## Decisions log

_Fill in after planning._
