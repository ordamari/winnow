import { describe, expect, it } from "vitest";

import { readExampleResume } from "./example-resume";

describe("readExampleResume", () => {
  it("parses resume-data.example.json", () => {
    expect(readExampleResume().personalInfo.name).toBe("Alex Rivera");
  });
});
