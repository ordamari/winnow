# T05: Quality tooling, CI & preview deploys

**Phase:** 0 · **Depends on:** T01 · **Size:** S

## Goal

Guardrails from day one so a growing codebase stays shippable.

## Scope

- Lint + format (ESLint flat config or Biome), import sorting, `typecheck` script.
- Unit tests (Vitest + Testing Library) and E2E (Playwright) with one smoke test.
- Typed env validation (e.g. `@t3-oss/env-nextjs` + zod) that fails the build on missing vars.
- GitHub Actions: install → lint → typecheck → test → build on every PR; Playwright on main.
- Preview deployments per PR (e.g. Vercel) with a non-production env.
- Error monitoring (e.g. Sentry) for client and server, source maps uploaded.
- Pre-commit hooks (lint-staged) and a PR template.
- Dependency updates (Renovate/Dependabot).

## Out of scope

Production infra, backups and domains (T38).

## Decisions (resolve in Plan mode)

- ESLint + Prettier vs. Biome.
- Hosting for previews (Vercel vs. alternatives).
- Error monitoring vendor.

## Acceptance criteria

- A PR shows passing CI checks and a preview URL.
- A thrown test error appears in the monitoring dashboard with a readable stack trace.

## Decisions log

- ESLint + Prettier, with `eslint-plugin-simple-import-sort`. Biome was not used.
- Vercel for preview deploys. Root directory is `apps/web`.
- Sentry (`@sentry/nextjs`) for client and server. Source maps upload only when `SENTRY_AUTH_TOKEN` is set.
- `NEXT_PUBLIC_SENTRY_DSN` is the one public exception to the server-only env rule. It is required when `VERCEL_ENV` is `preview` or `production`.
- `OPENAI_API_KEY` stays optional so manual building does not need a key.
- Dependabot (weekly npm and GitHub Actions), not Renovate.
- Node 22 (`.nvmrc` and `engines`).
- Playwright runs on pushes to `main`. Pull requests run lint, typecheck, Vitest, and build.
- The core unit tests already cover `sanitizeTailorResult`, including dropping unknown ids.
