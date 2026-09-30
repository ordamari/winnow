# T16: Application detail page

**Phase:** 2 · **Depends on:** T15, T13 · **Size:** M

## Goal

Everything about one application in one place, especially "what did I send and what did they ask for" before an interview.

## Scope

- `/applications/[id]`: header (company, title, status control, link out to job URL), tabs or sections:
  - **Job**: JD snapshot (formatted), extracted requirements (once T23 exists), original link.
  - **Resume sent**: embedded PDF of the exact version, download, "open in builder as new version".
  - **Timeline**: `application_events` + notes + reminders, add note inline.
  - **Contacts**: recruiter/hiring manager with LinkedIn/email.
  - **Details**: channel, referrer, salary expectation, location, custom fields.
- Edit-in-place for all fields.
- Keyboard nav between applications (j/k) from the dashboard.

## Out of scope

Interview prep generation (T39).

## Decisions (resolve in Plan mode)

- Full page vs. slide-over drawer from the dashboard (or both).
- Markdown notes vs. plain text.

## Acceptance criteria

- All data for an application viewable and editable from one screen.
- The PDF shown is byte-identical to the one downloaded at apply time.

## Decisions log

_Fill in after planning._
