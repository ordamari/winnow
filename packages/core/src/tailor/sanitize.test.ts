import { describe, expect, it } from "vitest";

import type { CatalogSlot, TailorCatalog } from "./catalog";
import { sanitizeTailorResult } from "./sanitize";
import type { TailorModelOutput } from "./schema";

function slot(id: string, versionIds = [`${id}-v1`]): CatalogSlot {
  return {
    id,
    defaultVersionId: versionIds[0] ?? `${id}-v1`,
    versions: versionIds.map((versionId, index) => ({
      id: versionId,
      label: `V${index + 1}`,
      text: `${id} ${versionId}`,
    })),
  };
}

function skill(id: string, categoryId: string | null) {
  return { id, name: id, categoryId };
}

function catalogWith(options: {
  skills: { id: string; name: string; categoryId: string | null }[];
  categories: { id: string; label: string }[];
  bullets?: CatalogSlot[];
  extraBullets?: CatalogSlot[];
  highlights?: CatalogSlot[];
}): TailorCatalog {
  return {
    currentTitle: "Engineer",
    summary: slot("summary", ["summary-v1", "summary-v2"]),
    skills: options.skills,
    categories: options.categories,
    experience: [
      {
        id: "job-1",
        company: "Acme",
        allowedTitles: ["Engineer", "Developer"],
        bullets: options.bullets ?? [slot("b1"), slot("b2"), slot("b3")],
      },
      {
        id: "job-2",
        company: "Beta",
        allowedTitles: ["Lead"],
        bullets: options.extraBullets ?? [],
      },
    ],
    highlights: options.highlights ?? [slot("h1", ["h1-v1", "h1-v2"])],
  };
}

function outputFor(catalog: TailorCatalog): TailorModelOutput {
  const slots = [
    catalog.summary,
    ...catalog.experience.flatMap((exp) => exp.bullets),
    ...catalog.highlights,
  ];
  return {
    selectedTitle: catalog.currentTitle,
    selectedVersions: slots.map((item) => ({
      id: item.id,
      versionId: item.defaultVersionId,
    })),
    experienceTitles: catalog.experience.map((exp) => ({
      id: exp.id,
      title: exp.allowedTitles[0] ?? "",
    })),
    enabledSkills: catalog.skills.map((item) => ({
      id: item.id,
      enabled: false,
    })),
    enabledBullets: catalog.experience.flatMap((exp) =>
      exp.bullets.map((bullet) => ({ id: bullet.id, enabled: false })),
    ),
    enabledHighlights: catalog.highlights.map((item) => ({
      id: item.id,
      enabled: false,
    })),
    skillCategoryId: catalog.skills.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
    })),
    bulletMatches: catalog.experience.flatMap((exp) =>
      exp.bullets.map((bullet) => ({
        id: bullet.id,
        matchPercent: 0,
        reason: "",
      })),
    ),
    highlightMatches: catalog.highlights.map((item) => ({
      id: item.id,
      matchPercent: 0,
      reason: "",
    })),
    jdMatch: { matchPercent: 40, reason: " Partial fit. " },
  };
}

function enabledIds(flags: Record<string, boolean>, ids: string[]): string[] {
  return ids.filter((id) => flags[id]);
}

describe("sanitizeTailorResult", () => {
  it("drops unknown ids and keeps omitted known ids disabled when floors are already met", () => {
    const skills = [
      ...Array.from({ length: 12 }, (_, index) =>
        skill(`kept-${index}`, "cat-c"),
      ),
      skill("omitted-skill", "cat-c"),
    ];
    const catalog = catalogWith({
      skills,
      categories: [{ id: "cat-c", label: "Core" }],
      highlights: [slot("h1"), slot("h-omitted")],
    });
    const raw = outputFor(catalog);
    raw.enabledSkills = [
      ...skills
        .filter((item) => item.id.startsWith("kept-"))
        .map((item) => ({ id: item.id, enabled: true })),
      { id: "no-such-skill", enabled: true },
    ];
    raw.enabledBullets = [
      { id: "b1", enabled: true },
      { id: "b2", enabled: true },
      { id: "no-such-bullet", enabled: true },
    ];
    raw.enabledHighlights = [{ id: "no-such-highlight", enabled: true }];

    const result = sanitizeTailorResult(raw, catalog);

    expect(result.enabledSkills["no-such-skill"]).toBeUndefined();
    expect(result.enabledBullets["no-such-bullet"]).toBeUndefined();
    expect(result.enabledHighlights["no-such-highlight"]).toBeUndefined();
    expect(result.enabledSkills["omitted-skill"]).toBe(false);
    expect(result.enabledBullets.b3).toBe(false);
    expect(result.enabledHighlights["h-omitted"]).toBe(false);
    expect(result.enabledHighlights.h1).toBe(false);
    expect(Object.keys(result.enabledSkills)).toEqual(
      skills.map((item) => item.id),
    );
  });

  it("falls back to catalog versions, titles, and categories", () => {
    const catalog = catalogWith({
      skills: [skill("react", "cat-ui"), skill("node", "cat-api")],
      categories: [
        { id: "cat-ui", label: "UI" },
        { id: "cat-api", label: "API" },
      ],
    });
    const raw = outputFor(catalog);
    raw.selectedTitle = "   ";
    raw.selectedVersions = [
      { id: "summary", versionId: "missing-version" },
      { id: "b1", versionId: "also-missing" },
    ];
    raw.experienceTitles = [
      { id: "job-1", title: "Chief Executive" },
      { id: "job-2", title: "Lead" },
    ];
    raw.skillCategoryId = [
      { id: "react", categoryId: "not-a-category" },
      { id: "node", categoryId: null },
    ];

    const result = sanitizeTailorResult(raw, catalog);

    expect(result.selectedTitle).toBe("Engineer");
    expect(result.selectedVersionById.summary).toBe("summary-v1");
    expect(result.selectedVersionById.b1).toBe("b1-v1");
    expect(result.selectedVersionById.h1).toBe("h1-v1");
    expect(result.experienceTitles["job-1"]).toBe("Engineer");
    expect(result.experienceTitles["job-2"]).toBe("Lead");
    expect(result.skillCategoryId.react).toBe("cat-ui");
    expect(result.skillCategoryId.node).toBeNull();
  });

  it("enables the first bullets in catalog order up to the per-role floor", () => {
    const catalog = catalogWith({
      skills: Array.from({ length: 12 }, (_, index) =>
        skill(`s${index}`, "cat"),
      ),
      categories: [{ id: "cat", label: "Cat" }],
      extraBullets: [slot("solo")],
    });
    const raw = outputFor(catalog);

    const result = sanitizeTailorResult(raw, catalog);

    expect(enabledIds(result.enabledBullets, ["b1", "b2", "b3"])).toEqual([
      "b1",
      "b2",
    ]);
    expect(result.enabledBullets.solo).toBe(true);
  });

  it("tops up a populated skill category to two and leaves an empty category empty", () => {
    const catalog = catalogWith({
      skills: [
        skill("a1", "cat-a"),
        skill("a2", "cat-a"),
        skill("a3", "cat-a"),
        skill("b1", "cat-b"),
        skill("b2", "cat-b"),
        ...Array.from({ length: 12 }, (_, index) =>
          skill(`c${index}`, "cat-c"),
        ),
      ],
      categories: [
        { id: "cat-a", label: "A" },
        { id: "cat-b", label: "B" },
        { id: "cat-c", label: "C" },
      ],
    });
    const raw = outputFor(catalog);
    raw.enabledSkills = [
      { id: "a1", enabled: true },
      ...Array.from({ length: 12 }, (_, index) => ({
        id: `c${index}`,
        enabled: true,
      })),
    ];

    const result = sanitizeTailorResult(raw, catalog);

    expect(enabledIds(result.enabledSkills, ["a1", "a2", "a3"])).toEqual([
      "a1",
      "a2",
    ]);
    expect(result.enabledSkills.b1).toBe(false);
    expect(result.enabledSkills.b2).toBe(false);
  });

  it("refills skills to 12, preferring a category that is already populated", () => {
    const catalog = catalogWith({
      skills: [
        ...Array.from({ length: 8 }, (_, index) => skill(`a${index}`, "cat-a")),
        ...Array.from({ length: 6 }, (_, index) => skill(`b${index}`, "cat-b")),
      ],
      categories: [
        { id: "cat-a", label: "A" },
        { id: "cat-b", label: "B" },
      ],
    });
    const raw = outputFor(catalog);
    raw.enabledSkills = [{ id: "a0", enabled: true }];

    const result = sanitizeTailorResult(raw, catalog);

    expect(
      enabledIds(
        result.enabledSkills,
        catalog.skills.map((item) => item.id),
      ),
    ).toEqual([
      "a0",
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "b0",
      "b1",
      "b2",
      "b3",
    ]);
    expect(result.enabledSkills.b4).toBe(false);
    expect(result.enabledSkills.b5).toBe(false);
  });

  it("clamps match percents and trims reasons", () => {
    const catalog = catalogWith({
      skills: [skill("react", "cat-ui")],
      categories: [{ id: "cat-ui", label: "UI" }],
      highlights: [slot("h1")],
    });
    const raw = outputFor(catalog);
    raw.bulletMatches = [
      { id: "b1", matchPercent: 150, reason: "  strong  " },
      { id: "b2", matchPercent: -4, reason: " weak " },
      { id: "b3", matchPercent: Number.NaN, reason: " n/a " },
      { id: "nope", matchPercent: 80, reason: "ignored" },
    ];
    raw.highlightMatches = [
      { id: "h1", matchPercent: 10.6, reason: " close " },
    ];
    raw.jdMatch = { matchPercent: 1000.2, reason: "  overall  " };

    const result = sanitizeTailorResult(raw, catalog);

    expect(result.bulletMatches.b1).toEqual({
      matchPercent: 100,
      reason: "strong",
    });
    expect(result.bulletMatches.b2.matchPercent).toBe(0);
    expect(result.bulletMatches.b3.matchPercent).toBe(0);
    expect(result.bulletMatches.nope).toBeUndefined();
    expect(result.highlightMatches.h1).toEqual({
      matchPercent: 11,
      reason: "close",
    });
    expect(result.jdMatch).toEqual({ matchPercent: 100, reason: "overall" });
  });
});
