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

- Route Handler `POST /api/tailor` replaces the server action. Cancel uses `AbortController`, and the route forwards `request.signal` to the OpenAI call.
- No partial structured streaming in this task. The Tailor panel shows preparing, calling, and applying stages plus Cancel. Streaming waits for T21.
- `OPENAI_MODELS` stays in `@winnow/core`. `tailorRequestSchema` rejects any other model id. Task-to-model routing stays with T21.
- The prompt and `sanitizeTailorResult` stay unchanged in behavior. The zod model schema and sanitizer stay in `@winnow/core` (the client needs `TailorResult`, and tests should not import `server-only`). The server module keeps the prompt and the API call. Catalog shape checks live in `tailorCatalogSchema`.
