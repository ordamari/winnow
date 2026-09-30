# T09: Bullet Bank Manager UI

**Phase:** 1 · **Depends on:** T08, T02 · **Size:** L

## Goal

Replace hand-editing JSON with a polished visual editor for the whole bank. This is the main UX barrier for anyone who isn't you.

## Scope

- `/bank` page: sections for personal info, summaries, experience, highlights, skills & categories, education.
- Experience editor: company, title, alternative titles (chips), period (month pickers + "present"), bullets.
- Slot editor: each bullet/summary/highlight shows its versions; add/rename/delete version, mark default, reorder; inline editing with `**bold**` support matching the PDF renderer.
- Drag-and-drop reorder (dnd-kit) for experiences, bullets, versions, skills.
- Skills: create, rename, assign to categories via drag between category columns.
- Autosave with optimistic updates, undo toast, "saved" indicator; conflict-safe (updated_at check).
- Character/line-length hints per bullet (helps one-page fit).
- Keyboard-first editing (enter = new version, cmd+enter = new bullet).
- JSON import/export entry points (from T08) in the page menu.
- Empty-state onboarding for a brand-new bank.

## Out of scope

AI assistance on bullet text (forbidden by principle #1), PDF import (T10).

## Decisions (resolve in Plan mode)

- Single long page vs. master/detail (list left, editor right).
- Rich text: plain textarea with `**` markup vs. a minimal Tiptap editor limited to bold.
- Whether to show a live mini PDF preview while editing.

## Acceptance criteria

- A new user can build a complete bank without touching JSON.
- Every edit persists and survives reload; reorder persists.
- Builder reflects bank edits immediately.

## Decisions log

_Fill in after planning._
