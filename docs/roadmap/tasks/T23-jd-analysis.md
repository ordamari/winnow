# T23: JD analysis & requirement extraction (cached)

**Phase:** 3 · **Depends on:** T21, T12 · **Size:** M

## Goal

Turn each pasted JD into a structured, reusable analysis once, then reuse it for tailoring, gap analysis, recommendations and the job pool.

## Scope

- Structured extraction: company, title, seniority, location/work mode, must-have vs. nice-to-have requirements (each as a short normalized statement + category: language, framework, domain, practice, soft skill, years), responsibilities, tech stack, domain/industry, red flags (e.g. "10+ years" for a mid role).
- `job_analyses` table linked to `jobs`, versioned by prompt version.
- **Cache** by `normalized_url` + `jd_hash`: same JD pasted by 10 people → one LLM call.
- Show analysis on application detail (T16) and in the new-application flow (T14): prefill company/title/location.
- Language handling: Hebrew and English JDs.

## Out of scope

Embeddings (T24), matching (T25).

## Decisions (resolve in Plan mode)

- Requirement granularity (atomic statements vs. grouped).
- Whether requirements get normalized against a canonical skill list (a light taxonomy for display/analytics only; ranking stays semantic per principle #5).
- Sync (inline in flow) vs. background job with status.

## Acceptance criteria

- Eval set of 15+ real JDs with checked extractions (reuse T22 harness).
- Second submission of the same JD makes zero LLM calls.

## Decisions log

_Fill in after planning._
