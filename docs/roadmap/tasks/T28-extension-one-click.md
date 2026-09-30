# T28: Extension: one-click tailor & PDF download

**Phase:** 4 · **Depends on:** T27, T25 · **Size:** M

## Goal

The "no-brainer" flow: on the job page, one click and a tailored one-page PDF is downloaded and the application is tracked, without leaving the tab.

## Scope

- Popup action "Tailor & download": server runs tailor v2 → saves version (T13 server rendering) → returns signed PDF URL → downloads with the proper filename.
- Shows JD match %, top covered requirements, and top gaps (T26) in the popup, with "Open in app to fine-tune".
- Marks the application as Saved or Applied (user choice, remembered).
- Optional: helper to attach the PDF to the site's file input (drag-and-drop or a download shortcut), only where feasible.
- Quota awareness (T33): show remaining credits / BYOK status.

## Out of scope

Auto-filling full application forms.

## Decisions (resolve in Plan mode)

- Default status after one-click (Saved vs. Applied).
- Whether to allow manual fine-tuning inside the popup (probably no; deep-link to the app).

## Acceptance criteria

- From job page to downloaded PDF in < 15 s on a typical JD.
- Application, version and JD snapshot visible in the dashboard afterwards.

## Decisions log

_Fill in after planning._
