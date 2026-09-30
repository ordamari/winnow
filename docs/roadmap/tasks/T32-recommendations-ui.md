# T32: Recommendations page & match alerts

**Phase:** 5 · **Depends on:** T31, T18 · **Size:** M

## Goal

Turn recommendations into action with one click, and bring users back when a strong match appears.

## Scope

- `/recommendations`: ranked cards with match %, freshness ("added 2 days ago"), why (covered requirements, success evidence), gaps, company/title/location.
- Actions: **Tailor for this** (opens T14 flow prefilled with the pool job), **Save**, **Not interested** (with a reason, which improves future ranking), **Open link**.
- Preferences panel (from T31).
- Alerts: instant for ≥ threshold matches (in-app + email/push), otherwise daily/weekly digest (reuse T18 infra).
- Feedback loop: clicks, tailors, and dismissals logged for evaluation.

## Out of scope

Recruiter-side features.

## Decisions (resolve in Plan mode)

- Alert threshold and frequency caps.
- Free-tier limits on recommendations (e.g. N per week, see T33).

## Acceptance criteria

- From a recommendation to a tailored PDF in two clicks.
- Dismissed jobs never reappear.

## Decisions log

_Fill in after planning._
