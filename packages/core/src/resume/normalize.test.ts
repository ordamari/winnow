import { describe, expect, it } from "vitest";

import { exportResumeData, parseResumeData } from "./normalize";

const legacy = {
  personalInfo: {
    name: "Alex Rivera",
    title: "Frontend Developer",
    phone: "555-010-2048",
    email: "alex.rivera.demo@example.com",
    linkedin: "linkedin.com/in/alex-rivera-demo",
    github: "github.com/alex-rivera-demo",
  },
  summary: {
    id: "summary",
    versions: [
      {
        id: "frontend",
        label: "Frontend",
        text: "Builds **React** apps.",
        defaultSelected: true,
      },
    ],
  },
  skillCategories: [{ id: "core", label: "Core" }],
  skills: [
    {
      id: "react",
      name: "React",
      defaultChecked: true,
      defaultCategoryId: "core",
    },
  ],
  experience: [
    {
      id: "northwind",
      company: "Northwind Labs",
      title: "Frontend Developer",
      alternativeTitles: [],
      period: "MAR 2024 - PRESENT",
      bullets: [
        {
          id: "nw-dashboard",
          defaultChecked: true,
          versions: [
            {
              id: "nw-dashboard-developer",
              label: "Developer",
              text: "Shipped **React** features.",
              defaultSelected: true,
            },
          ],
        },
      ],
    },
  ],
  technicalHighlights: [
    {
      id: "th-ai",
      defaultChecked: false,
      versions: [
        {
          id: "th-ai-default",
          label: "Default",
          text: "Prototyped with **OpenAI**.",
          defaultSelected: true,
        },
      ],
    },
  ],
  education: {
    institution: "Demo Tech Institute",
    program: "Full-Stack Development Bootcamp",
    period: "JAN 2022 - APR 2022",
  },
};

describe("parseResumeData", () => {
  it("turns a legacy resume into sections and round-trips the export", () => {
    const first = exportResumeData(parseResumeData(legacy));
    const second = exportResumeData(parseResumeData(first));
    expect(second).toEqual(first);

    const experience = first.sections.find(
      (section) => section.kind === "entries" && section.id === "experience",
    );
    const highlights = first.sections.find(
      (section) => section.kind === "entries" && section.id === "highlights",
    );
    const education = first.sections.find(
      (section) => section.kind === "entries" && section.id === "education",
    );
    expect(experience?.kind).toBe("entries");
    if (experience?.kind === "entries") {
      expect(experience.entries[0]?.organization).toBe("Northwind Labs");
      expect(experience.entries[0]?.alternativeTitles).toBeUndefined();
    }
    expect(highlights?.kind).toBe("entries");
    if (highlights?.kind === "entries") {
      expect(highlights.entries[0]?.period).toBeUndefined();
      expect(highlights.entries[0]?.id).toBe("th-ai");
    }
    expect(education?.kind).toBe("entries");
    if (education?.kind === "entries") {
      expect(education.entries[0]?.period).toBe("JAN 2022 - APR 2022");
      expect(education.entries[0]?.id).toBe("education");
    }
  });

  it("keeps a canonical file stable", () => {
    const canonical = exportResumeData(parseResumeData(legacy));
    expect(exportResumeData(parseResumeData(canonical))).toEqual(canonical);
  });
});
