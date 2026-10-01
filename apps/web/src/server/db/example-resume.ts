import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseResumeData } from "@winnow/core";

const examplePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../features/builder/data/resume-data.example.json",
);

export function readExampleResume() {
  const raw: unknown = JSON.parse(readFileSync(examplePath, "utf8"));
  return parseResumeData(raw);
}
