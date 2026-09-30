# T38: Production deployment & operations

**Phase:** 6 (pull earlier when inviting first users) · **Depends on:** T05, T06 · **Size:** M

## Goal

A reliable production environment others can depend on.

## Scope

- Environments: local / preview / staging (optional) / production, with separate DBs, keys and storage buckets.
- Domain, DNS, email sending domain (SPF/DKIM/DMARC for T18 emails).
- DB backups + tested restore, migration strategy for zero-downtime deploys.
- Monitoring: uptime checks, error alerts (T05), background job failures, AI provider outage fallback (T21).
- Performance budgets: Core Web Vitals tracking, PDF render time, tailor latency p95.
- Cost guardrails: provider spend limits, alerts.
- Runbook: deploy, rollback, rotate secrets, restore backup, incident notes.
- Feature flags for gradual rollout (e.g. tailor v2, recommendations).

## Out of scope

Multi-region.

## Decisions (resolve in Plan mode)

- Hosting (Vercel vs. alternatives) given background jobs and PDF rendering needs.
- Feature flag tool (PostHog flags, Vercel flags, or simple DB flags).

## Acceptance criteria

- A restore drill from backup succeeds.
- Rollback of a bad deploy takes < 5 minutes.

## Decisions log

_Fill in after planning._
