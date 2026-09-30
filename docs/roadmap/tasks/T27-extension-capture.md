# T27: Chrome extension MVP: capture job → app

**Phase:** 4 · **Depends on:** T14 · **Size:** M

## Goal

Remove the copy-paste friction: on any job page, click the extension and the job (URL + JD text) is in the app's new-application flow.

## Scope

- Manifest V3 extension (Chrome first; Edge works for free; Firefox later).
- Capture: current URL + JD text. Strategy: user text selection if present → site-specific extractors for LinkedIn, Comeet, Greenhouse, Lever, Workday → generic readability fallback. Runs in the user's browser (principle #4).
- Popup UI (same design tokens as T02): shows detected company/title and a JD preview, with "Save job" and "Tailor & apply" buttons.
- "Tailor & apply" opens `/new?draft=<id>` in the app with everything prefilled.
- "Already applied" badge when the current URL matches an existing application.
- Auth with the web app (per T07 decision), secure token storage.
- Packaging + Chrome Web Store listing prep (privacy disclosure, minimal permissions: `activeTab`, `scripting`, `storage`).

## Out of scope

In-popup tailoring and PDF download (T28).

## Decisions (resolve in Plan mode)

- Framework: WXT vs. Plasmo vs. plain Vite.
- Where it lives (monorepo `apps/extension` from T01).
- Extractor maintenance strategy (per-site selectors + LLM cleanup fallback on the server).

## Acceptance criteria

- On each of the five target sites, one click creates a draft with correct URL and clean JD text.
- Permissions are minimal; no background scraping.

## Decisions log

_Fill in after planning._
