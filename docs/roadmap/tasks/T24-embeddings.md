# T24: Embeddings pipeline (pgvector)

**Phase:** 3 · **Depends on:** T08, T23 · **Size:** M

## Goal

Vector representations of bank content and job requirements stored in Postgres, kept in sync with edits.

## Scope

- Embed every bullet/highlight/summary **version** (and optionally the slot as a whole), every extracted requirement, and a job-level vector (title + requirements).
- `embeddings` storage with `pgvector` columns + HNSW indexes; record model name + dimension so re-embedding is possible.
- Sync: re-embed on bank edits (debounced background job), content-hash to skip unchanged text.
- Similarity query helpers: top-K bullets for a requirement, requirement coverage matrix (requirements × bullets).
- Backfill script for existing data.
- A dev-only "similarity explorer" page to inspect nearest neighbors (great for learning and debugging).

## Out of scope

Using the vectors in the tailor (T25) or recommendations (T31).

## Decisions (resolve in Plan mode)

- Embedding model (e.g. `text-embedding-3-small` vs. a multilingual open model, since Hebrew JDs matter).
- What text exactly gets embedded (raw bullet vs. bullet + role/company context).
- Background job runner (reuse T18 choice).

## Acceptance criteria

- Editing a bullet updates its vector within a minute.
- Coverage matrix for a JD returns in < 200 ms for a typical bank.

## Decisions log

_Fill in after planning._
