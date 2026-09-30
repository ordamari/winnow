# T40: Hebrew UI / RTL & i18n (optional)

**Phase:** 7 · **Depends on:** T02 · **Size:** M

## Goal

Serve the Israeli community in Hebrew while resumes stay in whatever language the user writes.

## Scope

- i18n framework with message catalogs (English + Hebrew).
- RTL layout: logical CSS properties (`ms-`/`me-` in Tailwind), mirrored icons where needed, `dir` per locale.
- Locale-aware dates/numbers.
- Hebrew fonts for the UI; optional Hebrew resume PDF support (react-pdf font registration + RTL text), treated as a separate decision.
- Emails and extension popup localized.

## Out of scope

Machine-translating resume content (principle #1).

## Decisions (resolve in Plan mode)

- Library: `next-intl` vs. alternatives.
- Whether Hebrew resume PDFs are in scope.
- Start using logical CSS properties from T02 onward to make this cheap (recommended even if T40 is far away).

## Acceptance criteria

- Every screen renders correctly in Hebrew RTL with no untranslated strings.

## Decisions log

- **Library:** `next-intl` on Next.js 16. Locale routing lives in `apps/web/src/proxy.ts`.
- **URLs:** `localePrefix: 'as-needed'`. English is unprefixed (`/builder`). Hebrew is `/he/builder`. `/en/...` redirects to the unprefixed path. Locales: `en` (default) and `he`.
- **Detection:** next-intl default order: prefix, then the `NEXT_LOCALE` cookie, then `Accept-Language`, then English. The account menu writes the cookie when the language changes.
- **Persistence:** cookie only until accounts exist. T07 should read and write `profiles.locale` from the same preference.
- **Hebrew resume PDFs:** deferred until the builder is ported (T03).
- **Emails and the extension:** deferred until those surfaces exist.
- **UI package:** `@winnow/ui` does not depend on `next-intl`. Screens pass translated strings. English defaults stay as fallbacks.
- **Fonts:** Heebo for Hebrew UI, then Geist. Geist stays the Latin face.
- **RTL layout:** `dir` is set on `<html>`. The sidebar uses `side="right"` in Hebrew. Start/end utilities cover alignment, insets, and pinned icons. Physical coordinates that implement an explicit `side` stay as they are.
- **Dates and numbers:** formatted with next-intl in the `Asia/Jerusalem` time zone. The `/design` page shows one date and one number.
