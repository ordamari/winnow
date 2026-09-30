# T34: Billing & subscriptions

**Phase:** 6 · **Depends on:** T33 · **Size:** M

## Goal

Take payments for Pro subscriptions and credit packs.

## Scope

- Checkout for Pro monthly/yearly and credit packs; customer portal (change plan, cancel, invoices).
- Webhooks → plan state + credit grants in the T33 ledger; idempotent handling.
- Short-term plans suit job seekers: easy cancel, maybe a 1-month "job hunt pass".
- Tax/VAT handling (important selling from Israel to global customers).
- Dunning/failed payment emails; grace period.
- Test mode end-to-end in preview environments.

## Out of scope

B2B/recruiter monetization (future idea from the Gemini discussion; needs its own product thinking).

## Decisions (resolve in Plan mode)

- Provider: Stripe vs. a Merchant of Record (Lemon Squeezy / Paddle, which handle VAT/sales tax for you). Check current availability for an Israeli seller.
- Pricing currency (USD vs. ILS vs. both).

## Acceptance criteria

- Subscribe → Pro limits apply immediately; cancel → reverts at period end.
- Replayed webhooks don't double-grant credits.

## Decisions log

_Fill in after planning._
