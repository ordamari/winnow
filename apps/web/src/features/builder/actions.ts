"use server";

import type { TailorCatalog, TailorResult } from "@winnow/core";

import { TailorError, tailorResume } from "@/server/ai/tailor";

export type TailorActionError =
  | "missing-key"
  | "empty-jd"
  | "no-result"
  | "unknown";

export type TailorActionResult =
  | { ok: true; result: TailorResult }
  | { ok: false; error: TailorActionError };

export async function tailorResumeAction(input: {
  jobDescription: string;
  model: string;
  catalog: TailorCatalog;
}): Promise<TailorActionResult> {
  try {
    const result = await tailorResume(input);
    return { ok: true, result };
  } catch (error) {
    if (error instanceof TailorError) {
      return { ok: false, error: error.code };
    }
    return { ok: false, error: "unknown" };
  }
}
