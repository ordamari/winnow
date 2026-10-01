import {
  EDUCATION_SECTION_ID,
  EDUCATION_SECTION_TITLE,
  EXPERIENCE_SECTION_ID,
  EXPERIENCE_SECTION_TITLE,
  HIGHLIGHTS_SECTION_ID,
  HIGHLIGHTS_SECTION_TITLE,
  type ResumeData,
  SKILLS_SECTION_TITLE,
  SUMMARY_SECTION_TITLE,
  type TextVersion,
} from "./schema";

function version(id: string): TextVersion {
  return {
    id,
    label: "Default",
    text: "",
    defaultSelected: true,
  };
}

/** A blank bank with the standard sections and one empty item in each. */
export function emptyResumeData(): ResumeData {
  return {
    personalInfo: {
      name: "",
      title: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
    },
    summary: {
      id: "summary",
      versions: [version("summary-default")],
    },
    skillCategories: [{ id: "general", label: "General" }],
    skills: [
      {
        id: "skill-1",
        name: "",
        defaultChecked: true,
        defaultCategoryId: "general",
      },
    ],
    sections: [
      { kind: "summary", title: SUMMARY_SECTION_TITLE },
      {
        kind: "entries",
        id: EXPERIENCE_SECTION_ID,
        title: EXPERIENCE_SECTION_TITLE,
        entries: [
          {
            id: "experience-1",
            organization: "",
            title: "",
            bullets: [
              {
                id: "experience-1-bullet",
                defaultChecked: true,
                versions: [version("experience-1-bullet-default")],
              },
            ],
          },
        ],
      },
      { kind: "skills", title: SKILLS_SECTION_TITLE },
      {
        kind: "entries",
        id: HIGHLIGHTS_SECTION_ID,
        title: HIGHLIGHTS_SECTION_TITLE,
        entries: [
          {
            id: "highlight-1",
            defaultChecked: true,
            versions: [version("highlight-1-default")],
          },
        ],
      },
      {
        kind: "entries",
        id: EDUCATION_SECTION_ID,
        title: EDUCATION_SECTION_TITLE,
        entries: [
          {
            id: "education-1",
            organization: "",
            title: "",
          },
        ],
      },
    ],
  };
}
