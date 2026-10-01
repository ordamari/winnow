import { describe, expect, it } from "vitest";

import { formatPeriod, parsePeriod } from "./period";

describe("period", () => {
  it("parses and formats the stored resume period", () => {
    expect(parsePeriod("SEP 2025 - PRESENT")).toEqual({
      startMonth: "SEP",
      startYear: 2025,
      present: true,
    });
    expect(
      formatPeriod({
        startMonth: "SEP",
        startYear: 2025,
        present: true,
      }),
    ).toBe("SEP 2025 - PRESENT");
    expect(parsePeriod("OCT 2024 - SEP 2025")).toEqual({
      startMonth: "OCT",
      startYear: 2024,
      present: false,
      endMonth: "SEP",
      endYear: 2025,
    });
    expect(
      formatPeriod({
        startMonth: "OCT",
        startYear: 2024,
        present: false,
        endMonth: "SEP",
        endYear: 2025,
      }),
    ).toBe("OCT 2024 - SEP 2025");
  });

  it("leaves an unfamiliar period unparsed", () => {
    expect(parsePeriod("2020–present")).toBeNull();
    expect(parsePeriod(undefined)).toBeNull();
    expect(parsePeriod("")).toBeNull();
  });
});
