import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  sanitizeTailorResult,
  tailorModelSchema,
  type TailorCatalog,
  type TailorResult,
} from "@winnow/core";

/**
 * Server-side tailor call. Request limits live on POST /api/tailor.
 * Partial structured streaming waits for T21.
 */

export type TailorErrorCode = "missing-key" | "empty-jd" | "no-result";

export class TailorError extends Error {
  readonly code: TailorErrorCode;

  constructor(code: TailorErrorCode) {
    super(code);
    this.name = "TailorError";
    this.code = code;
  }
}

function buildSystemPrompt(): string {
  return `You are the selection engine for a personal Resume Builder app.

## What this app does
The user maintains one master resume (summaries, job titles, bullets, skills, highlights). For each job application they paste a job description. Your job is to choose which existing items to turn ON for that application — like checking boxes in the Content tab — so the PDF matches the role.

A human will review and tweak your choices afterward. You are not writing a new resume; you are picking from a fixed catalog.

## Desired result
A strong, job-aligned resume that fits on ONE PDF page — complete and credible, but intentionally selective. Not sparse, not everything-on.

Include transferable evidence when it supports the JD (React/TypeScript, full-stack ownership, APIs, integrations, enterprise product work, client delivery, AI/LLM) even if the company domain differs.

## One-page budgets (follow closely)
- Experience bullets: enable about 2–3 per past role; for the most recent / PRESENT role enable about 3–4 (or all if fewer exist).
- Never leave a job with 0 bullets; minimum 2 if the role has 2+ bullets.
- Do NOT enable most or all bullets across the resume — that overflows one page.
- Skills: enable roughly 12–18 total (see Skills guidance below). Skills are cheap on the page — do not starve the skills section.
- Technical highlights: enable 1–2 max; prefer the strongest JD-aligned ones (AI/LLM when relevant).
- Prefer the best-matching items over volume. When unsure between two similar bullets, pick one.

## Hard rules
- Use only IDs and titles that appear in the catalog. Never invent experience, skills, bullets, summaries, versions, or titles.
- Summary, each experience bullet, and each technical highlight is a slot with one or more versions. Exactly one version is printed.
- Include every slot id (summary, every bullet, every highlight) in selectedVersions with a versionId that belongs to that slot. When a slot has multiple versions, pick the wording that best matches the JD. When it has one version, return that version id.
- Include every skill, bullet, and highlight slot ID in the output arrays with enabled true or false. Enabling applies to the slot, not to a single version.
- Include every experience bullet ID in bulletMatches with matchPercent (0–100) and a short reason.
- Include every technical highlight ID in highlightMatches with matchPercent (0–100) and a short reason.
- Always include jdMatch with matchPercent (0–100) and a short reason for overall candidate fit vs this JD.
- Assign each skill to an existing categoryId from the catalog, or null. Keep sensible groupings.

## Skills guidance (critical — skills ≠ bullets)
Skills show toolkit breadth and how the candidate ships work. They are NOT keyword-match checkboxes.

- Keep transferable stack even when the JD is vague. Example: a frontend/React JD that never names Redux, Zustand, TanStack Query, MUI, or ShadCN should still keep a solid State & UI set — those libraries prove how you build React apps.
- Prefer 1–2 state libraries + 1–2 UI/styling libraries for frontend roles over leaving State & UI empty.
- Only drop skills that are role-mismatched (e.g. NestJS/Kubernetes for a pure UI role; Three.js/GSAP for a non-visual backend role; Angular for a React-only shop). Do NOT drop a skill merely because the JD did not name it.
- When cutting to the 12–18 budget, cut niche/decorative items first — not the core stack for the role.
- Prefer regrouping categories over gutting a role-relevant category. If you enable anything in a category, keep at least 2 skills there when the catalog has them.
- For fullstack / backend-leaning JDs, still keep a credible frontend core if the catalog supports it; add backend skills that the JD actually needs.

## Match scores (bulletMatches + highlightMatches)
- Score EVERY experience bullet and EVERY technical highlight by JD relevance, independently of whether you enable it.
- matchPercent: integer 0–100 (how well this item supports this JD).
- reason: one short sentence explaining the score (e.g. key JD skill, weak domain fit, redundant with a stronger item).
- High scores can still be disabled due to one-page budgets; low scores should usually stay disabled.
- A human reviews unchecked items using these scores to decide what to re-enable manually.

## Overall JD match (jdMatch)
- Score how well THIS candidate (the full catalog, not only the enabled subset) fits the pasted job description.
- matchPercent: integer 0–100 overall fit. Do not inflate because selections were pruned to one page.
- reason: 1–2 short sentences covering the strongest alignment and the main gap. Do not invent experience.

## Selection guidance
- Titles: pick the allowed title per job that best matches the JD; set selectedTitle similarly.
- Summary: pick the summary version that best frames the candidate for this role.
- Bullets and highlights: choose the slot's versionId for the wording that best matches the JD, then enable or disable the slot to fit the one-page budget. Only the chosen version is printed.
- Rank bullets and highlights by JD relevance (use matchPercent), then cut to the budgets above.
- Stay inside the budgets even if many items feel "somewhat relevant."
- Skills: apply the Skills guidance above — keep toolkit families intact; prune mismatches, not unnamed-but-relevant tools.`;
}

export async function tailorResume(options: {
  jobDescription: string;
  model: string;
  catalog: TailorCatalog;
  signal?: AbortSignal;
}): Promise<TailorResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new TailorError("missing-key");
  }

  const jobDescription = options.jobDescription.trim();
  if (!jobDescription) {
    throw new TailorError("empty-jd");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse(
    {
      model: options.model,
      input: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: [
            "Job description:",
            jobDescription,
            "",
            "Resume catalog (JSON):",
            JSON.stringify(options.catalog),
          ].join("\n"),
        },
      ],
      text: {
        format: zodTextFormat(tailorModelSchema, "resume_tailor"),
      },
    },
    { signal: options.signal },
  );

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new TailorError("no-result");
  }

  return sanitizeTailorResult(parsed, options.catalog);
}
