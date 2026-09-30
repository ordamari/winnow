# T07: Authentication & user accounts

**Phase:** 1 · **Depends on:** T06 · **Size:** M

## Goal

Secure sign-up/sign-in, protected app routes, and a user profile, designed so the browser extension (T27) can authenticate later.

## Scope

- Sign in with Google + GitHub + email magic link (or passkeys).
- Protected route group `(app)` via middleware; public routes for marketing/legal.
- `users` / `profiles` table: name, contact fields (seeds `personalInfo`), timezone, locale, onboarding state.
- Settings page: profile, connected accounts, sign out everywhere, delete account (hook for T36).
- Server helper `requireUser()` used by every server action/route; ownership checks centralized.
- Session strategy that the extension can reuse (token exchange / cookie on app domain).

## Out of scope

Billing plans (T33/T34), admin roles (T37) beyond a simple `role` column.

## Decisions (resolve in Plan mode)

- Auth library: Better Auth vs. Auth.js vs. Clerk vs. Supabase Auth (tie to the T06 provider choice).
- Which providers at launch.
- Extension auth approach (see T27): shared cookie, OAuth device-style flow, or short-lived API token.

## Acceptance criteria

- New user can sign up, lands in onboarding, and cannot access another user's data (tested).
- Unauthenticated access to `(app)` routes redirects to sign-in.
- E2E test covers sign-in → builder.

## Decisions log

_Fill in after planning._
