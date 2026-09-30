# T37: Admin panel & cost dashboard

**Phase:** 6 · **Depends on:** T33 · **Size:** M

## Goal

Operate the platform: see costs, users, and pool health, and handle support without touching the DB directly.

## Scope

- Role-gated `/admin`.
- **Costs**: AI spend per day/task/model/user (from `ai_calls`), cache hit rate, embedding volume, top spenders, alerts on budget thresholds.
- **Users**: search, plan, credits (grant/refund), impersonate-read-only for support (audited).
- **Job pool moderation** (T29): flagged jobs, duplicates merge, mark closed.
- **AI quality**: override rate trend, eval results history (T22), error/invalid-output rate.
- Audit log of admin actions.

## Out of scope

Customer support ticketing.

## Decisions (resolve in Plan mode)

- Build in-app vs. use an internal tool (Retool, or Supabase Studio for raw data) for parts of it.

## Acceptance criteria

- Daily AI cost visible within an hour of spend.
- Every admin action is in the audit log.

## Decisions log

_Fill in after planning._
