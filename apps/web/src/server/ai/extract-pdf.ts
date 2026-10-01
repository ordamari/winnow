import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

import { ResumeImportError } from "./resume-import";

export async function extractPdfText(
  data: Uint8Array,
): Promise<{ text: string; pages: number }> {
  try {
    const pdf = await getDocumentProxy(data);
    const extracted = await extractText(pdf, { mergePages: true });
    return { text: extracted.text, pages: extracted.totalPages };
  } catch (error) {
    if (error instanceof ResumeImportError) throw error;
    throw new ResumeImportError("invalid-pdf");
  }
}
