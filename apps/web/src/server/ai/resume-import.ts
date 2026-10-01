import "server-only";

import {
  type ImportSlot,
  RESUME_IMPORT_MODEL,
  RESUME_IMPORT_TASK,
  type ResumeExtraction,
  resumeExtractionSchema,
} from "@winnow/core";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

export type ResumeImportErrorCode =
  | "missing-key"
  | "no-text"
  | "no-result"
  | "too-large"
  | "too-many-pages"
  | "too-many-files"
  | "invalid-pdf"
  | "invalid-input";

export class ResumeImportError extends Error {
  readonly code: ResumeImportErrorCode;

  constructor(code: ResumeImportErrorCode) {
    super(code);
    this.name = "ResumeImportError";
    this.code = code;
  }
}

function buildSystemPrompt(): string {
  return `You extract a resume into structured fields for a bullet bank.

Copy strings verbatim from the source text. You may split and classify existing sentences into slots. You may not rewrite, summarize, fix grammar, translate, or add words that are not in the source.

Rules:
- Every non-empty string must appear in the source text. Bullet characters and line-wrap spaces may be dropped. Do not change wording.
- Group different wordings of the same achievement as versions of one bullet, in the order they appear.
- When an existing slot is that same achievement, set existingSlotId to its id and put only the new wording in versions. Otherwise set existingSlotId to an empty string.
- Leave unknown fields as empty strings. Do not invent contact details, skills, dates, or employers.
- A skill category must be a heading that appears in the source, or an empty string.
- alternativeTitles are other titles for the same role that appear in the source.
- highlights are short standalone points that are not bullets under a job.
- otherSections are headed blocks such as projects, courses, or volunteer work. Copy the heading into title.
- experience is work history. education is school. Do not put those in otherSections.`;
}

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return error instanceof Error && error.name === "APIUserAbortError";
}

export async function mapResumeImport(options: {
  sourceText: string;
  catalog: ImportSlot[];
  signal?: AbortSignal;
}): Promise<ResumeExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new ResumeImportError("missing-key");
  }

  const sourceText = options.sourceText.trim();
  if (!sourceText) throw new ResumeImportError("no-text");

  const client = new OpenAI({ apiKey });

  const once = async () => {
    const response = await client.responses.parse(
      {
        model: RESUME_IMPORT_MODEL,
        metadata: { task: RESUME_IMPORT_TASK },
        input: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: [
              "Existing slots (JSON). Set existingSlotId only when a new wording is the same achievement. Otherwise use an empty string.",
              JSON.stringify(options.catalog),
              "",
              "Source text:",
              sourceText,
            ].join("\n"),
          },
        ],
        text: {
          format: zodTextFormat(resumeExtractionSchema, "resume_import"),
        },
      },
      { signal: options.signal },
    );
    if (!response.output_parsed) throw new ResumeImportError("no-result");
    return response.output_parsed;
  };

  try {
    return await once();
  } catch (error) {
    if (isAbort(error, options.signal)) throw error;
    if (error instanceof ResumeImportError && error.code !== "no-result") {
      throw error;
    }
    try {
      return await once();
    } catch (retryError) {
      if (isAbort(retryError, options.signal)) throw retryError;
      if (retryError instanceof ResumeImportError) throw retryError;
      throw new ResumeImportError("no-result");
    }
  }
}
