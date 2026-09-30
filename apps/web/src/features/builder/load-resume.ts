import "server-only";

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { parseResumeData, type ResumeData } from "@winnow/core";

const dataDir = path.join(process.cwd(), "src/features/builder/data");

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadResumeData(): Promise<ResumeData> {
  const personalPath = path.join(dataDir, "resume-data.json");
  const examplePath = path.join(dataDir, "resume-data.example.json");
  const filePath = (await fileExists(personalPath)) ? personalPath : examplePath;
  const raw = await readFile(filePath, "utf8");
  return parseResumeData(JSON.parse(raw));
}
