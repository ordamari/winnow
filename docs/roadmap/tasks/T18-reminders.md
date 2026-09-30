# T18: Follow-up reminders & one-click status updates

**Phase:** 2 · **Depends on:** T15 · **Size:** M

## Goal

Beat data staleness: nudge users at the right time and make updating a status a single click, even from their inbox.

## Scope

- Rules engine (configurable per user): e.g. "Applied 7 days, no update → ask", "Applied 14 days → suggest follow-up", "Interview tomorrow → reminder with link to detail page", custom `next_action_at` reminders.
- Background jobs (scheduled): evaluate rules, create notifications.
- Channels: in-app notification center (bell), email digest (daily/weekly), optional browser push.
- Email with **signed one-click action links** ("Heard back → Screening", "Rejected", "Still waiting", "Mark ghosted") that update status without logging in (single-use, expiring tokens).
- Auto-suggest "Ghosted" after N days of silence (user confirms).
- Notification preferences & unsubscribe.

## Out of scope

WhatsApp/SMS (possible later), email inbox scanning (too invasive for now).

## Decisions (resolve in Plan mode)

- Job runner: Vercel Cron vs. Inngest vs. Trigger.dev vs. QStash.
- Email provider: Resend (+ React Email templates) vs. alternatives.
- Default rule thresholds.

## Acceptance criteria

- A 7-day-old application triggers an email; clicking "Screening" updates status and writes an event.
- Tokens are single-use and expire; unsubscribe works.

## Decisions log

_Fill in after planning._
