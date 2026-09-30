# T15: Applications dashboard (Kanban + table)

**Phase:** 2 · **Depends on:** T12, T02 · **Size:** L

## Goal

A dashboard better than your Google Sheet, so tracking is something users *want* to do.

## Scope

- `/applications` with two views sharing filters:
  - **Kanban** by stage, drag cards between columns (writes `application_events`), card shows company, title, days since applied, next action, match %.
  - **Table** (TanStack Table): sortable, column visibility, inline status change, bulk actions (archive, change status), CSV export.
- Filters: status, date range, source, company, channel, has-next-action, archived; saved views.
- Search across company/title/notes.
- One-click status update everywhere (status popover with keyboard shortcuts).
- Stale detection badges: "No update for 14 days" (feeds T18).
- Summary strip: active applications, interviews this week, response rate.
- URL-synced filter state; fast with 500+ applications (server pagination or virtualized list).

## Out of scope

Detail page (T16), reminders delivery (T18), deep analytics (T20).

## Decisions (resolve in Plan mode)

- Default view (Kanban vs. table) and mobile behavior (Kanban on mobile is awkward: list grouped by stage?).
- Server Components + server actions vs. client data layer (TanStack Query) for optimistic drag.
- Real-time sync across tabs (not needed initially?).

## Acceptance criteria

- Dragging a card updates status and creates an event, with optimistic UI and rollback on error.
- Filters persist in URL; saved views work.
- Table handles 1,000 rows smoothly.

## Decisions log

_Fill in after planning._
