# T01: Next.js project setup & repo strategy

**Phase:** 0 · **Depends on:** none · **Size:** S

## Goal

Stand up the Next.js (App Router, TypeScript, Tailwind v4, pnpm) project that will host the whole platform, with a structure that can later hold a browser extension and shared packages.

## Context

Today: Vite 8 + React 19 + TS 6 + Tailwind v4 + `@react-pdf/renderer` + `openai` + `zod`, no backend. Source is small (`App.tsx`, `ControlPanel.tsx`, `ResumePDF.tsx`, `useResumeState.ts`, `openaiTailor.ts`, types). Personal data lives in the gitignored `src/data/resume-data.json`.

## Scope

- Create the Next.js app (latest stable, App Router, `src/` dir, strict TS, path aliases).
- Decide repo layout and set up the workspace so T27 (extension) and shared code (`types`, zod schemas, PDF document) can live beside the web app.
- Folder conventions: `app/` routes, `features/<domain>/` (builder, bank, applications, ai…), `components/ui/`, `lib/`, `server/` (server-only code guarded with `server-only`).
- Base config: env loading, `.env.example`, `.gitignore` (keep personal resume JSON out of git), README update.
- Keep the old Vite app runnable until T03 is done (or archived in a branch/tag).

## Out of scope

UI design (T02), porting features (T03), database (T06).

## Decisions (resolve in Plan mode)

- **Repo:** migrate in place in `resume-builder` vs. a new repo (keep history? rename to product name?).
- **Layout:** single Next.js app vs. monorepo (pnpm workspaces / Turborepo) with `apps/web`, `apps/extension`, `packages/core`. Monorepo pays off once T27 starts.
- **Product name / domain**: needed for package names, later for auth callbacks and the extension.
- Bundler defaults (Turbopack) and React Compiler on/off.

## Acceptance criteria

- `pnpm dev` serves a Next.js hello page; `pnpm build` and `pnpm typecheck` pass.
- Folder conventions are documented in the README.
- The old app is either still runnable or preserved at a git tag.

## Decisions log

- **Repo:** new repo `winnow` (`Development/winnow`). `resume-builder` stays untouched and runnable. No history migration.
- **Name:** Winnow. Workspace scope `@winnow/*`. Feature folders stay `builder`, `bank`, `applications`, `ai`.
- **Layout:** pnpm workspaces with `apps/web`, `packages/ui`, and `packages/core`. No Turborepo. No `apps/extension` until T27. Not microfrontends.
- **Bundler:** Turbopack (Next.js 16 default for dev and production).
- **React Compiler:** off. Stable in Next 16 but opt-in and slower to compile. Revisit after the builder is ported.
- **Next.js:** 16.3.7.
