import { describe, expect, it } from "vitest";

import type { ResumeData } from "../resume/schema";
import { importFlags, textAppearsInSource } from "./verbatim";

describe("textAppearsInSource", () => {
  it("joins wrapped lines", () => {
    expect(
      textAppearsInSource(
        "Led a team of\nfive engineers.",
        "Led a team of five engineers.",
      ),
    ).toBe(true);
  });

  it("ignores a leading bullet", () => {
    expect(
      textAppearsInSource(
        "• Led a team of five engineers.",
        "Led a team of five engineers.",
      ),
    ).toBe(true);
  });

  it("treats ligatures as the same letters", () => {
    expect(textAppearsInSource("file systems", "ﬁle systems")).toBe(true);
  });

  it("keeps hyphens inside a word", () => {
    expect(
      textAppearsInSource("full-stack product work", "full-stack product work"),
    ).toBe(true);
  });

  it("flags a rewritten word", () => {
    expect(
      textAppearsInSource(
        "Led a team of five engineers.",
        "Managed a team of five engineers.",
      ),
    ).toBe(false);
  });

  it("flags a string that is not in the source", () => {
    expect(
      textAppearsInSource(
        "Led a team of five engineers.",
        "Invented a quantum compiler.",
      ),
    ).toBe(false);
  });
});

describe("importFlags", () => {
  it("flags only strings missing from the source", () => {
    const data: ResumeData = {
      personalInfo: {
        name: "Ada",
        title: "",
        phone: "",
        email: "nope@example.com",
        linkedin: "",
        github: "",
      },
      summary: {
        id: "summary",
        versions: [
          {
            id: "s1",
            label: "Default",
            text: "Builds tools.",
            defaultSelected: true,
          },
        ],
      },
      skills: [],
      skillCategories: [],
      sections: [
        { kind: "summary", title: "Summary" },
        { kind: "skills", title: "Skills" },
      ],
    };

    expect(importFlags("Ada\nBuilds tools.", data)).toEqual([
      { path: "personalInfo.email", text: "nope@example.com" },
    ]);
  });
});
