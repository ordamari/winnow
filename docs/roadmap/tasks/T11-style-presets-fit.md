# T11: Style presets & one-page fit assistant

**Phase:** 1 · **Depends on:** T03, T08 · **Size:** M

## Goal

Make "exactly one page" effortless: save style presets and detect/fix overflow automatically.

## Scope

- Persist style per user: named presets (e.g. "Default", "Dense"), set a default preset.
- Page-count detection from the rendered PDF; live indicator "1 page ✓ / 1.2 pages ⚠ / 0.8 page".
- "Fit to one page" action: deterministic search over allowed style ranges (font size, line height, spacing, margins) to reach exactly one page with minimal visual change; show what changed and allow undo.
- When style alone can't fit, suggest which enabled items to drop (lowest match % first when Tailor data exists). Never auto-remove content silently.
- Optional: additional PDF templates (layout variants) built on the same data.

## Out of scope

Non-PDF formats (principle #3).

## Decisions (resolve in Plan mode)

- How to measure fill level (react-pdf layout callbacks vs. rendering to buffer and counting pages, and measuring remaining whitespace).
- Search strategy (ordered step-down rules vs. binary search per parameter).
- Templates now or as a later add-on.

## Acceptance criteria

- For a bank that overflows by a few lines, "Fit to one page" produces one page without dropping content.
- Presets persist across sessions and apply to saved versions (T13).

## Decisions log

_Fill in after planning._
