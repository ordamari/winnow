# Winnow

Winnow is a job-search platform: a private bullet bank, a one-page PDF resume, and a personal applications tracker. The AI selects from your own writing and never drafts new resume text.

## Run

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the Next.js app. `pnpm build` and `pnpm typecheck` check the workspace.

Copy `apps/web/.env.example` to `apps/web/.env` when a task needs secrets. Keys stay server-only: never use the `NEXT_PUBLIC_` prefix. Personal resume JSON (`resume-data.json`) is gitignored; example JSON files can be committed.

## Layout

pnpm workspace. Shared packages are imported as `@winnow/ui` and `@winnow/core`.

- `apps/web` — Next.js App Router app (Turbopack, Tailwind v4, strict TypeScript).
- `packages/ui` — shared React components. The design system lands here in T02. The Chrome extension will import it later.
- `packages/core` — shared types, Zod schemas, and the PDF document in later tasks.
- `apps/extension` — not created yet. The extension framework is chosen in T27.

Inside `apps/web/src`:

- `app/` — routes.
- `features/builder`, `features/bank`, `features/applications`, `features/ai` — product domains.
- `components/ui/` — app-local composition. Shared components belong in `packages/ui`.
- `lib/` — shared helpers that are not server-only.
- `server/` — server-only code. Modules here import `server-only`, so a Client Component cannot import them.

The previous Vite app stays in the sibling `resume-builder` repo and is unchanged.
