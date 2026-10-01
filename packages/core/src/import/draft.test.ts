import { describe, expect, it } from "vitest";

import { emptyResumeData } from "../resume/empty";
import { parseResumeData } from "../resume/normalize";
import type { ResumeData, ResumeSection } from "../resume/schema";
import { mergeBulletAsVersion, mergeResumeExtraction } from "./draft";
import type { ResumeExtraction } from "./schema";
import { importFlags } from "./verbatim";

function ids() {
  let n = 0;
  return () => `id-${++n}`;
}

function extraction(
  overrides: Partial<ResumeExtraction> = {},
): ResumeExtraction {
  return {
    personalInfo: {
      name: "",
      title: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
    },
    summaries: [],
    skills: [],
    experience: [],
    highlights: [],
    education: [],
    otherSections: [],
    ...overrides,
  };
}

function role(
  organization: string,
  title: string,
  versions: string[],
  existingSlotId = "",
) {
  return {
    organization,
    title,
    alternativeTitles: [],
    period: "",
    url: "",
    bullets: [{ versions, existingSlotId }],
  };
}

function experienceSection(data: ResumeData) {
  const section = data.sections.find(
    (item) => item.kind === "entries" && item.id === "experience",
  );
  if (!section || section.kind !== "entries") {
    throw new Error("missing experience");
  }
  return section;
}

function bulletTexts(section: Extract<ResumeSection, { kind: "entries" }>) {
  return section.entries.flatMap((entry) =>
    (entry.bullets ?? []).map((bullet) => ({
      id: bullet.id,
      versions: bullet.versions.map((version) => version.text),
    })),
  );
}

describe("mergeResumeExtraction", () => {
  it("drops a repeated version", () => {
    const draft = mergeResumeExtraction({
      existing: null,
      createId: ids(),
      extraction: extraction({
        experience: [
          role("Northwind", "Engineer", [
            "Shipped the billing API.",
            "Shipped the billing API.",
          ]),
        ],
      }),
    });

    expect(
      bulletTexts(experienceSection(draft)).map((bullet) => bullet.versions),
    ).toEqual([["Shipped the billing API."]]);
  });

  it("folds the same company and title into the existing entry", () => {
    const existing = mergeResumeExtraction({
      existing: emptyResumeData(),
      createId: ids(),
      extraction: extraction({
        experience: [
          role("Northwind", "Engineer", ["Shipped the billing API."]),
        ],
      }),
    });

    const draft = mergeResumeExtraction({
      existing,
      createId: ids(),
      extraction: extraction({
        experience: [
          role("northwind", "engineer", [
            "Shipped the billing API.",
            "Opened the public API.",
          ]),
        ],
      }),
    });

    const section = experienceSection(draft);
    expect(section.entries).toHaveLength(1);
    expect(section.entries[0]?.organization).toBe("Northwind");
    expect(bulletTexts(section).map((bullet) => bullet.versions)).toEqual([
      ["Shipped the billing API."],
      ["Opened the public API."],
    ]);
  });

  it("adds a paraphrase as another version of the matched slot", () => {
    const existing = mergeResumeExtraction({
      existing: null,
      createId: ids(),
      extraction: extraction({
        experience: [role("Northwind", "Engineer", ["Led a team of five."])],
      }),
    });
    const bulletId = bulletTexts(experienceSection(existing))[0]?.id;
    expect(bulletId).toBeTruthy();

    const draft = mergeResumeExtraction({
      existing,
      createId: ids(),
      extraction: extraction({
        experience: [
          role(
            "Elsewhere",
            "Manager",
            ["Managed a team of five."],
            bulletId ?? "",
          ),
        ],
      }),
    });

    const section = experienceSection(draft);
    expect(section.entries).toHaveLength(1);
    expect(bulletTexts(section)).toEqual([
      {
        id: bulletId,
        versions: ["Led a team of five.", "Managed a team of five."],
      },
    ]);
  });

  it("creates a bullet when the slot id is unknown", () => {
    const draft = mergeResumeExtraction({
      existing: null,
      createId: ids(),
      extraction: extraction({
        experience: [
          role("Northwind", "Engineer", ["Opened the public API."], "missing"),
        ],
      }),
    });

    const [bullet] = bulletTexts(experienceSection(draft));
    expect(bullet?.id).not.toBe("missing");
    expect(bullet?.versions).toEqual(["Opened the public API."]);
  });

  it("passes parseResumeData and flags a rewritten bullet", () => {
    const source = [
      "Alex Rivera",
      "Northwind",
      "Engineer",
      "Led a team of five engineers.",
    ].join("\n");
    const draft = mergeResumeExtraction({
      existing: null,
      createId: ids(),
      extraction: extraction({
        personalInfo: {
          name: "Alex Rivera",
          title: "",
          phone: "",
          email: "",
          linkedin: "",
          github: "",
        },
        experience: [
          role("Northwind", "Engineer", ["Managed a team of five engineers."]),
        ],
      }),
    });

    expect(parseResumeData(draft)).toEqual(draft);
    const flags = importFlags(source, draft);
    expect(flags.map((flag) => flag.text)).toEqual([
      "Managed a team of five engineers.",
    ]);
    expect(flags[0]?.path).toContain("bullets");
  });
});

describe("mergeBulletAsVersion", () => {
  it("moves a bullet onto another bullet in the same role", () => {
    const draft = mergeResumeExtraction({
      existing: null,
      createId: ids(),
      extraction: extraction({
        experience: [
          {
            organization: "Northwind",
            title: "Engineer",
            alternativeTitles: [],
            period: "",
            url: "",
            bullets: [
              { versions: ["Shipped the billing API."], existingSlotId: "" },
              { versions: ["Opened the public API."], existingSlotId: "" },
            ],
          },
        ],
      }),
    });
    const entry = experienceSection(draft).entries[0];
    const [first, second] = entry?.bullets ?? [];
    expect(first && second).toBeTruthy();
    if (!first || !second || !entry) return;

    const merged = mergeBulletAsVersion(
      draft,
      "experience",
      entry.id,
      second.id,
      first.id,
    );
    expect(bulletTexts(experienceSection(merged))).toEqual([
      {
        id: first.id,
        versions: ["Shipped the billing API.", "Opened the public API."],
      },
    ]);
  });
});
