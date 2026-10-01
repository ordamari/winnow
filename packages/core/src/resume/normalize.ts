import { z } from "zod";

import {
  EDUCATION_SECTION_ID,
  EDUCATION_SECTION_TITLE,
  EXPERIENCE_SECTION_ID,
  EXPERIENCE_SECTION_TITLE,
  HIGHLIGHTS_SECTION_ID,
  HIGHLIGHTS_SECTION_TITLE,
  personalInfoSchema,
  type ResumeData,
  resumeDataSchema,
  type ResumeSection,
  resumeSectionSchema,
  type SectionEntry,
  skillCategorySchema,
  SKILLS_SECTION_TITLE,
  skillSchema,
  SUMMARY_SECTION_TITLE,
  type TextVersion,
  type VersionedText,
  versionedTextSchema,
} from "./schema";

const legacyExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  alternativeTitles: z.array(z.string()),
  period: z.string(),
  bullets: z.array(versionedTextSchema),
});

const legacyEducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string(),
  program: z.string(),
  period: z.string().optional(),
});

const looseResumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: versionedTextSchema,
  skills: z.array(skillSchema),
  skillCategories: z.array(skillCategorySchema),
  experience: z.array(legacyExperienceSchema).optional(),
  technicalHighlights: z.array(versionedTextSchema).optional(),
  education: z
    .union([legacyEducationSchema, z.array(legacyEducationSchema)])
    .optional(),
  sections: z.array(resumeSectionSchema).optional(),
});

type LooseResume = z.infer<typeof looseResumeSchema>;

function filled(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value;
}

function compactVersions(versions: TextVersion[]): TextVersion[] {
  return versions.map((version) => ({
    id: version.id,
    label: version.label,
    text: version.text,
    defaultSelected: version.defaultSelected ?? false,
  }));
}

function compactBullet(bullet: VersionedText): VersionedText {
  return {
    id: bullet.id,
    defaultChecked: bullet.defaultChecked ?? false,
    versions: compactVersions(bullet.versions),
  };
}

function compactEntry(entry: SectionEntry): SectionEntry {
  const compacted: SectionEntry = { id: entry.id };
  const organization = filled(entry.organization);
  const title = filled(entry.title);
  const period = filled(entry.period);
  if (organization) compacted.organization = organization;
  if (title) compacted.title = title;
  if (entry.alternativeTitles?.length) {
    compacted.alternativeTitles = [...entry.alternativeTitles];
  }
  if (period) compacted.period = period;
  const url = filled(entry.url);
  if (url) compacted.url = url;
  if (entry.versions?.length) {
    compacted.defaultChecked = entry.defaultChecked ?? false;
    compacted.versions = compactVersions(entry.versions);
  }
  if (entry.bullets?.length) {
    compacted.bullets = entry.bullets.map(compactBullet);
  }
  return compacted;
}

function compactSection(section: ResumeSection): ResumeSection {
  if (section.kind !== "entries") return { ...section };
  return {
    kind: "entries",
    id: section.id,
    title: section.title,
    entries: section.entries.map(compactEntry),
  };
}

/** Stable JSON shape: empty optional entry fields are omitted. */
export function exportResumeData(data: ResumeData): ResumeData {
  return {
    personalInfo: { ...data.personalInfo },
    summary: {
      id: data.summary.id,
      versions: compactVersions(data.summary.versions),
    },
    skills: data.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      ...(skill.defaultChecked === undefined
        ? {}
        : { defaultChecked: skill.defaultChecked }),
      defaultCategoryId: skill.defaultCategoryId,
    })),
    skillCategories: data.skillCategories.map((category) => ({
      id: category.id,
      label: category.label,
    })),
    sections: data.sections.map(compactSection),
  };
}

function withStandardSections(sections: ResumeSection[]): ResumeSection[] {
  const next = sections.map(compactSection);
  if (!next.some((section) => section.kind === "summary")) {
    next.unshift({ kind: "summary", title: SUMMARY_SECTION_TITLE });
  }
  if (!next.some((section) => section.kind === "skills")) {
    const summaryIndex = next.findIndex(
      (section) => section.kind === "summary",
    );
    next.splice(summaryIndex + 1, 0, {
      kind: "skills",
      title: SKILLS_SECTION_TITLE,
    });
  }
  return next;
}

function educationEntries(education: LooseResume["education"]): SectionEntry[] {
  if (!education) return [];
  const list = Array.isArray(education) ? education : [education];
  return list.map((item, index) => {
    const entry: SectionEntry = {
      id:
        item.id ??
        (list.length === 1
          ? EDUCATION_SECTION_ID
          : `${EDUCATION_SECTION_ID}-${index + 1}`),
      organization: item.institution,
      title: item.program,
    };
    if (item.period) entry.period = item.period;
    return entry;
  });
}

function legacySections(loose: LooseResume): ResumeSection[] {
  const sections: ResumeSection[] = [
    { kind: "summary", title: SUMMARY_SECTION_TITLE },
  ];

  if (loose.experience?.length) {
    sections.push({
      kind: "entries",
      id: EXPERIENCE_SECTION_ID,
      title: EXPERIENCE_SECTION_TITLE,
      entries: loose.experience.map((job) => ({
        id: job.id,
        organization: job.company,
        title: job.title,
        alternativeTitles: job.alternativeTitles,
        period: job.period,
        bullets: job.bullets,
      })),
    });
  }

  sections.push({ kind: "skills", title: SKILLS_SECTION_TITLE });

  if (loose.technicalHighlights?.length) {
    sections.push({
      kind: "entries",
      id: HIGHLIGHTS_SECTION_ID,
      title: HIGHLIGHTS_SECTION_TITLE,
      entries: loose.technicalHighlights.map((highlight) => ({
        id: highlight.id,
        defaultChecked: highlight.defaultChecked ?? false,
        versions: highlight.versions,
      })),
    });
  }

  const education = educationEntries(loose.education);
  if (education.length > 0) {
    sections.push({
      kind: "entries",
      id: EDUCATION_SECTION_ID,
      title: EDUCATION_SECTION_TITLE,
      entries: education,
    });
  }

  return sections;
}

export function parseResumeData(input: unknown): ResumeData {
  const loose = looseResumeSchema.parse(input);
  const sections = loose.sections
    ? withStandardSections(loose.sections)
    : legacySections(loose);
  return resumeDataSchema.parse(
    exportResumeData({
      personalInfo: loose.personalInfo,
      summary: loose.summary,
      skills: loose.skills,
      skillCategories: loose.skillCategories,
      sections,
    }),
  );
}

export function summarizeResume(data: ResumeData) {
  const entrySections = data.sections.filter(
    (section) => section.kind === "entries",
  );
  let jobs = 0;
  let bullets = 0;
  for (const section of entrySections) {
    for (const entry of section.entries) {
      const count = entry.bullets?.length ?? 0;
      if (count > 0) {
        jobs += 1;
        bullets += count;
      }
    }
  }
  return {
    jobs,
    bullets,
    sections: entrySections.length,
    sectionTitles: entrySections.map((section) => section.title),
  };
}
