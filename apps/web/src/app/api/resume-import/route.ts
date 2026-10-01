import {
  combineImportSource,
  importFlags,
  importSlotCatalog,
  mergeResumeExtraction,
} from "@winnow/core";
import { NextResponse } from "next/server";
import { APIUserAbortError } from "openai";

import { extractPdfText } from "@/server/ai/extract-pdf";
import { rememberImportSource } from "@/server/ai/import-source";
import { clientIp, takeResumeImportSlot } from "@/server/ai/rate-limit";
import { mapResumeImport, ResumeImportError } from "@/server/ai/resume-import";
import { getUser } from "@/server/auth/session";
import { loadBankForUser } from "@/server/bank/store";
import { db } from "@/server/db/client";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_PAGES = 8;
const MAX_TEXT_CHARS = 60_000;
const BODY_MAX_BYTES = 14 * 1024 * 1024;

function errorJson(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const current = await getUser();
  if (!current) return errorJson("unauthorized", 401);

  if (!takeResumeImportSlot(clientIp(request.headers))) {
    return errorJson("rate-limited", 429);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > BODY_MAX_BYTES) {
    return errorJson("too-large", 413);
  }

  try {
    const form = await request.formData();
    const pasted = form.get("text");
    const text = typeof pasted === "string" ? pasted.trim() : "";
    const files = form
      .getAll("file")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0 && !text) {
      return errorJson("invalid-input", 400);
    }
    if (files.length > MAX_FILES) return errorJson("too-many-files", 400);
    if (text.length > MAX_TEXT_CHARS) return errorJson("too-large", 413);
    if (files.some((file) => file.size > MAX_FILE_BYTES)) {
      return errorJson("too-large", 413);
    }

    const parts: string[] = [];
    let pages = 0;
    for (const file of files) {
      const extracted = await extractPdfText(
        new Uint8Array(await file.arrayBuffer()),
      );
      pages += extracted.pages;
      if (pages > MAX_PAGES) return errorJson("too-many-pages", 413);
      if (extracted.text.trim()) parts.push(extracted.text.trim());
    }
    if (text) parts.push(text);

    const sourceText = parts.join("\n").trim();
    if (!sourceText) return errorJson("no-text", 422);
    if (sourceText.length > MAX_TEXT_CHARS) return errorJson("too-large", 413);

    const existing = await loadBankForUser(db, current.user.id);
    const extraction = await mapResumeImport({
      sourceText,
      catalog: existing ? importSlotCatalog(existing.data) : [],
      signal: request.signal,
    });
    const draft = mergeResumeExtraction({
      existing: existing?.data ?? null,
      extraction,
    });
    const flags = importFlags(
      combineImportSource(sourceText, existing?.data ?? null),
      draft,
    );
    rememberImportSource(current.user.id, sourceText);
    return NextResponse.json({ sourceText, draft, flags });
  } catch (error) {
    if (request.signal.aborted || error instanceof APIUserAbortError) {
      return new NextResponse(null, { status: 499 });
    }
    if (error instanceof ResumeImportError) {
      const status =
        error.code === "no-result"
          ? 502
          : error.code === "missing-key"
            ? 500
            : error.code === "no-text"
              ? 422
              : error.code === "too-large" || error.code === "too-many-pages"
                ? 413
                : 400;
      return errorJson(error.code, status);
    }
    return errorJson("unknown", 500);
  }
}
