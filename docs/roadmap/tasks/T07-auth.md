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

- **Library:** Better Auth on the T06 Postgres database, through `@better-auth/drizzle-adapter` and the pooled Drizzle client. User ids are UUIDs. SQL columns are snake_case; Drizzle property names stay the camelCase names Better Auth expects.
- **Providers:** Google, GitHub, and email magic link. Passkeys are deferred. OAuth buttons stay hidden until that provider's client id and secret are set. Magic links go through Resend when `RESEND_API_KEY` is set, are logged in development, and are stored for Playwright when `E2E_TEST=1`.
- **Extension:** The browser keeps an httpOnly session cookie. Settings can mint a one-time code (3 minutes, stored hashed in `verification`). `POST /api/extension/session` exchanges it for a new session token that expires in one hour. `requireUser()` accepts that token as `Authorization: Bearer`. The extension client stays in T27.
- **Ownership:** App layer only. `requireUser()` guards `(app)` routes. `assertOwner()` and `ownedBy()` are the shared checks. No RLS.
- **Delete:** Deleting an account revokes its sessions and, in `user.delete.before`, removes that user's profile and demo resume rows. T36 extends that hook to storage, traces, and vectors.
