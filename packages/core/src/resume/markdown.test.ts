import { describe, expect, it } from "vitest";

import { markdownLineHint, markdownPlainText, markdownRuns } from "./markdown";

describe("markdownRuns", () => {
  it("splits bold and links", () => {
    expect(markdownRuns("Builds **React** apps.")).toEqual([
      { type: "text", value: "Builds " },
      { type: "bold", children: [{ type: "text", value: "React" }] },
      { type: "text", value: " apps." },
    ]);
    expect(markdownRuns("See [docs](https://example.com/docs).")).toEqual([
      { type: "text", value: "See " },
      {
        type: "link",
        url: "https://example.com/docs",
        children: [{ type: "text", value: "docs" }],
      },
      { type: "text", value: "." },
    ]);
  });

  it("drops javascript links and keeps the label", () => {
    expect(markdownRuns("[click](javascript:alert(1))")).toEqual([
      { type: "text", value: "click" },
    ]);
  });

  it("counts visible characters", () => {
    expect(markdownPlainText("**React** and [docs](https://example.com)")).toBe(
      "React and docs",
    );
    expect(markdownLineHint("")).toEqual({ characters: 0, lines: 0 });
    expect(markdownLineHint("**ab**")).toEqual({ characters: 2, lines: 1 });
  });
});
