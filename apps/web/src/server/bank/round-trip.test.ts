import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { exportResumeData, parseResumeData } from "@winnow/core";
import { describe, expect, it } from "vitest";

const examplePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../features/builder/data/resume-data.example.json",
);

describe("resume-data.example.json", () => {
  it("round-trips through import and export", () => {
    const raw: unknown = JSON.parse(readFileSync(examplePath, "utf8"));
    const exported = exportResumeData(parseResumeData(raw));
    expect(raw).toEqual(exported);
    expect(exportResumeData(parseResumeData(exported))).toEqual(exported);
  });
});
