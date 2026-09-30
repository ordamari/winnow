# T04: Move AI Tailor to the server

**Phase:** 0 · **Depends on:** T03 · **Size:** S

## Goal

Remove the browser-exposed `VITE_OPENAI_API_KEY` by moving the tailor call to a server route, keeping the existing prompt, zod schema and sanitization unchanged.

## Context

`src/lib/openaiTailor.ts` calls `client.responses.parse` with `dangerouslyAllowBrowser: true`, then `sanitizeTailorResult` enforces known IDs and soft floors (min bullets per role, min skills per category, min 12 skills).

## Scope

- Server-only module (`server/ai/tailor.ts`) containing the prompt, schema and sanitizer.
- Route Handler or Server Action `POST /api/tailor` taking `{ jobDescription, model, catalog }`, validating input with zod, returning `TailorResult`.
- Keep `buildTailorCatalog` shared (client builds catalog, server re-validates it).
- Loading/progress UX in the Tailor panel (streamed status or at least a staged spinner), clear error messages, cancel.
- Basic input limits (JD length, catalog size) and a simple per-IP rate limit placeholder until T33.
- Unit tests for `sanitizeTailorResult` (unknown IDs dropped, floors applied, version fallback).

## Out of scope

Provider abstraction/BYOK (T21), retrieval (T25).

## Decisions (resolve in Plan mode)

- Route Handler vs. Server Action.
- Whether to stream partial structured output now or wait for T21.
- Model list: keep the current `OPENAI_MODELS` list or make it server-configured.

## Acceptance criteria

- No API key in the client bundle (verify by searching the build output).
- Tailor results identical in structure to the current implementation.
- Sanitizer has test coverage for its rules.

## Decisions log

_Fill in after planning._
