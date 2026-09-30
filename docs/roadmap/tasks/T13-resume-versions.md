# T13: Saved resume versions (immutable snapshots)

**Phase:** 2 · **Depends on:** T12 · **Size:** M

## Goal

Save exactly what was sent for each application: which bullets and versions, which titles, which style, and the PDF itself, so it can be re-downloaded and compared forever, even after the bank changes.

## Scope

- `resume_versions`: `user_id`, `bank_id`, `name`, `selections` (the `ResumeSelections` shape), `style`, `rendered_snapshot` (the resolved text actually printed), `tailor_result` (AI match data if used), `pdf_file_key`, `page_count`, `created_from` (manual / ai / duplicate).
- "Save version" in the builder; "Load version" restores selections into the builder; "Duplicate as new".
- Snapshot is immutable; editing creates a new version.
- Server-side PDF rendering (`@react-pdf/renderer` `renderToBuffer`) so the stored PDF doesn't depend on the client, and the extension (T28) can reuse it.
- Store PDF in object storage; signed download URLs.
- Versions list page with search, preview thumbnails, "used in N applications".
- Handle bank drift: if a referenced slot/version was later edited or deleted, the version still renders from `rendered_snapshot`.

## Out of scope

Diff UI (T17), linking to applications in UI (T14).

## Decisions (resolve in Plan mode)

- Store PDF blobs vs. regenerate on demand from snapshot (recommended: both; blob is the source of truth for "what was sent").
- Thumbnail generation approach.
- Retention / storage limits per plan.

## Acceptance criteria

- Saving then editing the bank does not change the saved version's PDF.
- Loading a version reproduces the builder state.
- Server-rendered PDF is identical to the client export.

## Decisions log

_Fill in after planning._
