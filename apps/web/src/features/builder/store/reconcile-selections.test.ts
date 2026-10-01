import { buildInitialSelections, type ResumeData } from "@winnow/core";
import { describe, expect, it } from "vitest";

import { reconcileSelections } from "./reconcile-selections";

function sample(): ResumeData {
  return {
    personalInfo: {
      name: "Ada",
      title: "Engineer",
      phone: "",
      email: "ada@example.com",
      linkedin: "",
      github: "",
    },
    summary: {
      id: "summary",
      versions: [
        { id: "sum-a", label: "A", text: "A", defaultSelected: true },
        { id: "sum-b", label: "B", text: "B" },
      ],
    },
    skillCategories: [{ id: "cat-lang", label: "Languages" }],
    skills: [
      {
        id: "skill-ts",
        name: "TypeScript",
        defaultChecked: true,
        defaultCategoryId: "cat-lang",
      },
    ],
    sections: [
      { kind: "summary", title: "Summary" },
      {
        kind: "entries",
        id: "experience",
        title: "Work",
        entries: [
          {
            id: "job-1",
            organization: "Acme",
            title: "Engineer",
            alternativeTitles: ["Developer"],
            bullets: [
              {
                id: "bullet-1",
                defaultChecked: true,
                versions: [
                  {
                    id: "b1-a",
                    label: "A",
                    text: "Did things",
                    defaultSelected: true,
                  },
                  { id: "b1-b", label: "B", text: "Did more" },
                ],
              },
            ],
          },
        ],
      },
      { kind: "skills", title: "Skills" },
      {
        kind: "entries",
        id: "highlights",
        title: "Highlights",
        entries: [
          {
            id: "highlight-1",
            defaultChecked: true,
            versions: [
              {
                id: "h1-a",
                label: "A",
                text: "Highlight",
                defaultSelected: true,
              },
            ],
          },
        ],
      },
    ],
  };
}

function experienceBullets(data: ResumeData) {
  const section = data.sections.find((item) => item.kind === "entries");
  if (!section || section.kind !== "entries") {
    throw new Error("missing experience");
  }
  return section.entries[0]?.bullets ?? [];
}

describe("reconcileSelections", () => {
  it("drops a deleted slot and fills defaults for a new one", () => {
    const previous = sample();
    const next = sample();
    const bullets = experienceBullets(next);
    bullets.push({
      id: "bullet-2",
      defaultChecked: false,
      versions: [
        { id: "b2-a", label: "A", text: "New", defaultSelected: true },
      ],
    });
    bullets.splice(
      bullets.findIndex((bullet) => bullet.id === "bullet-1"),
      1,
    );

    const selections = buildInitialSelections(previous);
    selections.enabledBullets["bullet-1"] = false;

    const result = reconcileSelections(previous, next, selections);

    expect(result.enabledBullets["bullet-1"]).toBeUndefined();
    expect(result.selectedVersionById["bullet-1"]).toBeUndefined();
    expect(result.enabledBullets["bullet-2"]).toBe(false);
    expect(result.selectedVersionById["bullet-2"]).toBe("b2-a");
  });

  it("falls back when the selected version was deleted", () => {
    const previous = sample();
    const next = sample();
    const [bullet] = experienceBullets(next);
    bullet?.versions.splice(1, 1);

    const selections = buildInitialSelections(previous);
    selections.selectedVersionById["bullet-1"] = "b1-b";

    const result = reconcileSelections(previous, next, selections);

    expect(result.selectedVersionById["bullet-1"]).toBe("b1-a");
  });

  it("keeps a version and an enable flag the user already chose", () => {
    const previous = sample();
    const next = sample();
    next.skills[0] = { ...next.skills[0], name: "TS" };

    const selections = buildInitialSelections(previous);
    selections.selectedVersionById["bullet-1"] = "b1-b";
    selections.enabledBullets["bullet-1"] = false;

    const result = reconcileSelections(previous, next, selections);

    expect(result.selectedVersionById["bullet-1"]).toBe("b1-b");
    expect(result.enabledBullets["bullet-1"]).toBe(false);
    expect(result.skillList[0]?.name).toBe("TS");
  });

  it("keeps a skill name the user changed and a session-only category", () => {
    const previous = sample();
    const next = sample();
    next.skills[0] = { ...next.skills[0], name: "TS" };
    next.skillCategories = [{ id: "cat-lang", label: "Langs" }];

    const selections = buildInitialSelections(previous);
    selections.skillList[0] = { ...selections.skillList[0], name: "Typed JS" };
    selections.categoryList.push({ id: "cat-extra", label: "Mine" });

    const result = reconcileSelections(previous, next, selections);

    expect(result.skillList[0]?.name).toBe("Typed JS");
    expect(result.categoryList.map((category) => category.label)).toEqual([
      "Langs",
      "Mine",
    ]);
  });

  it("drops a bank category that was deleted and keeps the user's headline", () => {
    const previous = sample();
    const next = sample();
    next.skillCategories = [];
    next.skills[0] = { ...next.skills[0], defaultCategoryId: null };
    next.personalInfo = { ...next.personalInfo, title: "Lead" };

    const selections = buildInitialSelections(previous);
    selections.selectedTitle = "Custom headline";
    selections.categoryList.push({ id: "cat-extra", label: "Mine" });

    const result = reconcileSelections(previous, next, selections);

    expect(result.categoryList.map((category) => category.id)).toEqual([
      "cat-extra",
    ]);
    expect(result.skillCategoryId["skill-ts"]).toBeNull();
    expect(result.selectedTitle).toBe("Custom headline");
  });
});
