# T26: Gap analysis & "grow your bank" loop

**Phase:** 3 · **Depends on:** T25, T09 · **Size:** M

## Goal

Turn uncovered requirements into authentic bank growth: "This job asks for CI/CD and Micro-Frontends, and nothing in your bank covers it. Have you done this? Add a bullet."

## Scope

- From T25 coverage: list requirements with no/weak coverage, split must-have vs. nice-to-have, with an adjusted "fit if covered" hint.
- Per gap actions: **Add bullet** (opens bank editor in context of the right experience, the user writes the text themselves), **I don't have this** (dismiss; remembered for similar future requirements), **Covered but missed** (user points to an existing bullet, logged as an eval signal for T22).
- Bank-level report: most frequent gaps across all your tracked jobs ("7 of your last 10 jobs asked for Docker").
- After adding a bullet: re-run tailor for the current job in one click.

## Out of scope

Writing the bullet for the user (principle #1). Course/affiliate suggestions (possible later in T34 context).

## Decisions (resolve in Plan mode)

- Where the gap panel lives (builder side panel vs. application detail vs. both).
- Threshold for "weak" coverage.

## Acceptance criteria

- For a JD with a known missing skill, the gap is listed and "Add bullet" lands in the right editor spot.
- Dismissed gaps don't reappear for semantically equivalent requirements.

## Decisions log

_Fill in after planning._
