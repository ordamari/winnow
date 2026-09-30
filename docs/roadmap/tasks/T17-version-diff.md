# T17: Resume version diff

**Phase:** 2 · **Depends on:** T13 · **Size:** S

## Goal

Compare any two saved versions (or a version vs. current builder state) to see what changed: "what did I emphasize for Company A vs. Company B?"

## Scope

- Structural diff on selections (not text diff of the PDF): bullets added/removed per role, version wording swapped, title changes, skills added/removed, highlights, summary version, style changes.
- Word-level diff where the same slot uses different versions.
- Entry points: versions list (select two), application detail ("compare with…").
- Side-by-side PDF preview toggle.

## Out of scope

Diffing the bank itself over time (maybe later via audit log).

## Decisions (resolve in Plan mode)

- Diff library for word-level text (`diff`/`diff-match-patch`) vs. custom.
- Presentation: unified list vs. two-column.

## Acceptance criteria

- Diff between two versions lists every selection difference correctly (unit tests on fixtures).

## Decisions log

_Fill in after planning._
