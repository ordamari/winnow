# T02: Design system & app shell

**Phase:** 0 · **Depends on:** T01 · **Size:** M

## Goal

A production-level visual foundation: design tokens, component library, and the authenticated app shell that every later screen plugs into.

## Scope

- Component library setup (e.g. shadcn/ui on Radix + Tailwind v4) with themed tokens: color scales, radius, spacing, typography, shadows, motion.
- Light/dark mode with system default and persisted preference.
- App shell: sidebar navigation (Builder, Bank, Applications, Recommendations, Insights, Settings), top bar (search / command palette, user menu), responsive collapse on mobile.
- Shared patterns: page header, empty state, skeleton loaders, error boundary UI, toasts, confirm dialog, data table, form primitives (react-hook-form + zod), status badges, match-percent indicator (reuse the Tailor match UI idea).
- Icon set (e.g. lucide) and font choice (e.g. Geist / Inter via `next/font`).
- A `/design` (dev-only) page showing all components for visual QA.
- Accessibility baseline: focus rings, keyboard navigation, color contrast AA.

## Out of scope

Marketing/landing page (T35), feature screens.

## Decisions (resolve in Plan mode)

- Component base: shadcn/ui vs. alternatives (Mantine, HeroUI, Park UI).
- Visual direction: brand color, density (compact tool vs. airy SaaS), reference products (Linear, Notion, Teal, Huntr).
- Command palette (cmdk) now or later.
- Whether to design in Figma first or code-first.

## Acceptance criteria

- Shell renders with working nav, theme toggle, and responsive behavior down to 375px.
- `/design` page shows all primitives in both themes.
- Lighthouse accessibility ≥ 95 on the shell.

## Decisions log

- **Component base:** shadcn/ui on Base UI (`base-nova`, `@base-ui/react`). No Radix.
- **Visual direction:** compact workbench. Zinc neutrals, `--radius: 0.375rem`, amber primary. Geist and Lucide.
- **Command palette:** deferred to T41. The top bar has a disabled Search control.
- **Design process:** code-first. No Figma.
- **Data table:** presentational `Table` pattern. TanStack Table waits for T15.
- **Form:** shadcn `Field` with react-hook-form and zod. The `form` registry item ships no files on `base-nova`.
