# T03: Port the resume builder into Next.js

**Phase:** 0 · **Depends on:** T01, T02 · **Size:** M

## Goal

Feature-parity port of the current builder into the new app and design system. Still local data (JSON), still no DB, so it can ship before accounts exist.

## Context

Current features to preserve:

- **Content tab**: summary version radio, experience bullets with per-bullet toggle and version select, alternative job titles per role, main title, skills with category CRUD/assignment, technical highlights, personal info editing.
- **Style tab**: accent color, font family, font sizes, line height, margins, section spacing, bullet indent, section borders, reset.
- **Tailor tab**: model select, JD paste, apply AI selections to Content, per-bullet/highlight match % and reason, overall JD match.
- Live PDF preview and export with filename derived from personal info.

Code: `src/components/ControlPanel.tsx` (846 lines, will be split), `ResumePDF.tsx`, `useResumeState.ts`, `openaiTailor.ts`, `types/resume.ts`, `types/tailor.ts`.

## Scope

- Route `/builder` rendering the three panels + live preview inside the app shell.
- Split `ControlPanel` into feature components (`ContentPanel`, `StylePanel`, `TailorPanel`, sub-sections).
- `@react-pdf/renderer` as a client-only component (dynamic import, no SSR); debounce re-render for performance.
- Move state to a store (e.g. Zustand) or keep the hook, but shape it so T08 can swap the data source from JSON to the DB.
- Move `ResumeData`/`ResumeSelections`/`ResumeStyle` types and zod schemas to the shared location from T01.
- Restyle with T02 components; keep behavior identical.

## Out of scope

Server-side AI (T04), persistence (T08/T13).

## Decisions (resolve in Plan mode)

- State management: keep `useResumeState` vs. Zustand vs. reducer + context.
- Layout: side-by-side panels vs. resizable split view; mobile behavior of the preview.
- Whether to also render PDFs server-side later (`renderToBuffer`) and so keep `ResumePDF` isomorphic now.

## Acceptance criteria

- Every feature listed above works on `/builder` with the same results as the Vite app for the same JSON.
- PDF output is visually identical (compare exports side by side).
- No hydration or SSR errors; preview stays responsive while toggling.

## Decisions log

_Fill in after planning._
