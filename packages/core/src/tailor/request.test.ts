import { describe, expect, it } from "vitest";

import type { TailorCatalog } from "./catalog";
import {
  JD_MAX_LENGTH,
  tailorRequestError,
  tailorRequestSchema,
} from "./schema";

function minimalCatalog(): TailorCatalog {
  return {
    currentTitle: "Engineer",
    summary: {
      id: "summary",
      defaultVersionId: "v1",
      versions: [{ id: "v1", label: "Default", text: "Summary" }],
    },
    skills: [],
    categories: [],
    experience: [],
    highlights: [],
  };
}

function request(overrides: Record<string, unknown> = {}) {
  return {
    jobDescription: "Build product interfaces.",
    model: "gpt-4o",
    catalog: minimalCatalog(),
    ...overrides,
  };
}

describe("tailorRequestSchema", () => {
  it("accepts a trimmed job description and an allowlisted model", () => {
    const parsed = tailorRequestSchema.safeParse(
      request({ jobDescription: "  Build product interfaces.  " }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.jobDescription).toBe("Build product interfaces.");
      expect(parsed.data.model).toBe("gpt-4o");
    }
  });

  it("rejects an empty job description", () => {
    const parsed = tailorRequestSchema.safeParse(
      request({ jobDescription: "   " }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(tailorRequestError(parsed.error)).toBe("empty-jd");
    }
  });

  it("rejects a job description over the length cap", () => {
    const parsed = tailorRequestSchema.safeParse(
      request({ jobDescription: "a".repeat(JD_MAX_LENGTH + 1) }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(tailorRequestError(parsed.error)).toBe("too-large");
    }
  });

  it("rejects a model that is not on the allowlist", () => {
    const parsed = tailorRequestSchema.safeParse(
      request({ model: "gpt-99" }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(tailorRequestError(parsed.error)).toBe("invalid-model");
    }
  });

  it("rejects a catalog that is not the expected shape", () => {
    const parsed = tailorRequestSchema.safeParse(request({ catalog: {} }));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(tailorRequestError(parsed.error)).toBe("invalid-input");
    }
  });
});
