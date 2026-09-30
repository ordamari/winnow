import { z } from "zod";

export const personalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  phone: z.string(),
  email: z.string(),
  linkedin: z.string(),
  github: z.string(),
});

export const textVersionSchema = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string(),
  defaultSelected: z.boolean().optional(),
});

export const versionedTextSchema = z.object({
  id: z.string(),
  defaultChecked: z.boolean().optional(),
  versions: z.array(textVersionSchema),
});

export const renderedTextSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  defaultChecked: z.boolean().optional(),
  defaultCategoryId: z.string().nullable(),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const skillCategoryViewSchema = skillCategorySchema.extend({
  skills: z.array(skillSchema),
});

/** Printed headings for the standard summary and skills blocks. */
export const SUMMARY_SECTION_TITLE = "Summary";
export const SKILLS_SECTION_TITLE = "Skills";

/** Stable ids used when a legacy resume is imported. */
export const EXPERIENCE_SECTION_ID = "experience";
export const EXPERIENCE_SECTION_TITLE = "Work Experience";
export const HIGHLIGHTS_SECTION_ID = "highlights";
export const HIGHLIGHTS_SECTION_TITLE = "Technical Highlights";
export const EDUCATION_SECTION_ID = "education";
export const EDUCATION_SECTION_TITLE = "Education";

export const sectionEntrySchema = z.object({
  id: z.string(),
  organization: z.string().optional(),
  title: z.string().optional(),
  alternativeTitles: z.array(z.string()).optional(),
  period: z.string().optional(),
  defaultChecked: z.boolean().optional(),
  versions: z.array(textVersionSchema).optional(),
  bullets: z.array(versionedTextSchema).optional(),
});

export const summarySectionSchema = z.object({
  kind: z.literal("summary"),
  title: z.string(),
});

export const skillsSectionSchema = z.object({
  kind: z.literal("skills"),
  title: z.string(),
});

export const entriesSectionSchema = z.object({
  kind: z.literal("entries"),
  id: z.string(),
  title: z.string(),
  entries: z.array(sectionEntrySchema),
});

export const resumeSectionSchema = z.discriminatedUnion("kind", [
  summarySectionSchema,
  skillsSectionSchema,
  entriesSectionSchema,
]);

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: versionedTextSchema,
  skills: z.array(skillSchema),
  skillCategories: z.array(skillCategorySchema),
  sections: z.array(resumeSectionSchema),
});

export const resumeSelectionsSchema = z.object({
  selectedVersionById: z.record(z.string(), z.string()),
  selectedTitle: z.string(),
  enabledSkills: z.record(z.string(), z.boolean()),
  enabledBullets: z.record(z.string(), z.boolean()),
  enabledHighlights: z.record(z.string(), z.boolean()),
  experienceTitles: z.record(z.string(), z.string()),
  skillList: z.array(skillSchema),
  categoryList: z.array(skillCategorySchema),
  skillCategoryId: z.record(z.string(), z.string().nullable()),
});

export const fontFamilySchema = z.enum(["Helvetica", "Times-Roman", "Courier"]);

export const resumeStyleSchema = z.object({
  accentColor: z.string(),
  fontFamily: fontFamilySchema,
  nameFontSize: z.number(),
  subtitleFontSize: z.number(),
  sectionHeaderFontSize: z.number(),
  bodyFontSize: z.number(),
  lineHeight: z.number(),
  pageMarginTop: z.number(),
  pageMarginBottom: z.number(),
  pageMarginLeft: z.number(),
  pageMarginRight: z.number(),
  sectionSpacing: z.number(),
  bulletIndent: z.number(),
  showSectionBorders: z.boolean(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type TextVersion = z.infer<typeof textVersionSchema>;
export type VersionedText = z.infer<typeof versionedTextSchema>;
export type RenderedText = z.infer<typeof renderedTextSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type SkillCategoryView = z.infer<typeof skillCategoryViewSchema>;
export type SectionEntry = z.infer<typeof sectionEntrySchema>;
export type ResumeSection = z.infer<typeof resumeSectionSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type ResumeSelections = z.infer<typeof resumeSelectionsSchema>;
export type ResumeStyle = z.infer<typeof resumeStyleSchema>;

export const DEFAULT_STYLE: ResumeStyle = {
  accentColor: "#2b5797",
  fontFamily: "Helvetica",
  nameFontSize: 20,
  subtitleFontSize: 10,
  sectionHeaderFontSize: 9,
  bodyFontSize: 8,
  lineHeight: 1.4,
  pageMarginTop: 30,
  pageMarginBottom: 30,
  pageMarginLeft: 40,
  pageMarginRight: 35,
  sectionSpacing: 12,
  bulletIndent: 8,
  showSectionBorders: true,
};

export function defaultVersionId(slot: VersionedText): string {
  const selected = slot.versions.find((version) => version.defaultSelected);
  return (selected ?? slot.versions[0])?.id ?? "";
}

export function selectedVersion(
  slot: VersionedText,
  selectedId: string | undefined,
): TextVersion | undefined {
  return (
    slot.versions.find((version) => version.id === selectedId) ??
    slot.versions.find((version) => version.id === defaultVersionId(slot))
  );
}
