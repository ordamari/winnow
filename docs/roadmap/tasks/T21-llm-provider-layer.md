# T21: LLM provider layer, AI framework choice & BYOK

**Phase:** 3 · **Depends on:** T04, T07 · **Size:** M

## Goal

One server-side AI layer that every AI feature goes through: multi-provider, structured outputs, cost tracking, and Bring-Your-Own-Key.

## Scope

- Framework decision and setup (see Decisions). Wrap it in a thin internal API: `generateStructured({ task, schema, input, model })`, `embed(texts)`.
- Providers: OpenAI, Anthropic, Google (at least two), with a task→model routing config (cheap model for extraction, strong model for ranking).
- Per-call accounting: tokens in/out, cost estimate, latency, user, task → `ai_calls` table (feeds T33 and T37).
- Retries, timeouts, fallback provider, schema-repair on invalid output.
- Prompt registry: prompts as versioned files with IDs (feeds T22).
- **BYOK**: user stores their own provider key (encrypted at rest with envelope encryption / KMS), key validation, calls using a BYOK key skip platform quota.
- Migrate the existing Tailor to this layer with no behavior change.

## Out of scope

Evals (T22), retrieval (T24/T25).

## Decisions (resolve in Plan mode)

- **Vercel AI SDK** (great Next.js DX, structured output, streaming) vs. **LangChain.js / LangGraph.js** (the learning goal, agents/graphs, retrievers) vs. AI SDK for app calls + LangGraph only for multi-step pipelines (T25, T31).
- Key encryption approach (libsodium + env master key vs. cloud KMS).
- Which providers/models at launch.

## Acceptance criteria

- Tailor runs through the new layer on two providers with identical sanitized output shape.
- Every AI call is recorded with cost.
- BYOK key is never returned to the client and is unreadable in a DB dump.

## Decisions log

_Fill in after planning._
