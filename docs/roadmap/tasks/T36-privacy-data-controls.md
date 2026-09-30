# T36: Privacy & data controls

**Phase:** 6 (but required before T29) · **Depends on:** T07, T12 · **Size:** M

## Goal

Resumes are PII-heavy. Earn trust and meet GDPR / Israeli Privacy Protection Law expectations before any data sharing exists.

## Scope

- Data map: which tables hold PII, where it's sent (LLM providers, tracing, email), retention per category.
- Encryption: at rest (provider), plus field-level encryption for the most sensitive fields (contact details, BYOK keys).
- **Export all my data** (JSON + PDFs zip) and **delete my account** (hard delete + purge from storage, traces and vectors; pool jobs they contributed stay as anonymous job data if opted in).
- Consent & settings: community pool sharing, emails, analytics.
- LLM provider settings: zero-data-retention / no-training options where available; documented in the privacy policy.
- Trace redaction rules (T22) and log scrubbing.
- Security basics: CSP headers, dependency audit, authz tests for every route (no IDOR), secrets rotation doc.

## Out of scope

Formal certifications (SOC 2 etc.).

## Decisions (resolve in Plan mode)

- Field-level encryption scope (cost: those fields can't be searched).
- Retention periods for traces and deleted-account backups.

## Acceptance criteria

- Delete account removes every row/file for that user (verified by a test that scans all user-owned tables).
- Export contains everything visible in the app.

## Decisions log

_Fill in after planning._
