# T33: Plans, quotas, usage metering & rate limiting

**Phase:** 6 · **Depends on:** T21 · **Size:** M

## Goal

Keep AI costs bounded and set up the freemium model from the Gemini discussion, independent of which payment provider is used.

## Scope

- Plan definitions in config: **Free** (unlimited manual builder + tracker, principle #2; N AI tailors/month; limited recommendations/week), **Pro** (high/unlimited tailors, instant match alerts, full gap analysis), **BYOK** (own key, platform AI limits don't apply, small or no fee), **credit packs** (one-time).
- Credit ledger (`credit_transactions`): grants, consumption per AI task (tailor, JD analysis, PDF import), refunds on failure.
- Enforcement middleware in the T21 layer: check → reserve → commit/refund.
- Rate limiting per user/IP on AI and auth endpoints (e.g. Upstash Ratelimit).
- Usage UI: remaining credits, history, upgrade CTA at the limit (not before).
- Cache hits (T23) are free to the user.

## Out of scope

Payment processing (T34).

## Decisions (resolve in Plan mode)

- Initial numbers (free tailors/month, Pro price point, e.g. $10–19).
- Credits vs. simple monthly caps.
- Whether BYOK is free or a small subscription.

## Acceptance criteria

- A free user hitting the limit gets a clear message and no AI call is made.
- Failed AI calls refund credits.
- Ledger balances reconcile with `ai_calls`.

## Decisions log

_Fill in after planning._
