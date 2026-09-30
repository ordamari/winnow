# T19: Import tracker from Google Sheets / CSV

**Phase:** 2 · **Depends on:** T12 · **Size:** S

## Goal

Migrate existing trackers (including yours) in minutes, so users don't start from zero.

## Scope

- Upload CSV/XLSX or paste a Google Sheets export.
- Column-mapping UI with auto-detection (company, role, link, date, status, notes) and a status-value mapper (their "Interview 1" → our Technical).
- Preview with validation errors per row; import creates jobs + applications + a synthetic event history.
- Dedupe by normalized URL / company+title.
- Undo import (batch id).

## Out of scope

Live two-way sync with Sheets.

## Decisions (resolve in Plan mode)

- File parsing only vs. also Google Sheets API (OAuth scope cost vs. convenience).
- LLM-assisted column mapping (cheap, nice) vs. heuristic only.

## Acceptance criteria

- Your current sheet imports with correct statuses and dates.
- Import is reversible.

## Decisions log

_Fill in after planning._
