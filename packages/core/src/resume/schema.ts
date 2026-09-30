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

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  alternativeTitles: z.array(z.string()),
  period: z.string(),
  bullets: z.array(versionedTextSchema),
});

export const renderedExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  period: z.string(),
  bullets: z.array(renderedTextSchema),
});

export const educationSchema = z.object({
  institution: z.string(),
  program: z.string(),
  period: z.string(),
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: versionedTextSchema,
  skills: z.array(skillSchema),
  skillCategories: z.array(skillCategorySchema),
  experience: z.array(experienceSchema),
  technicalHighlights: z.array(versionedTextSchema),
  education: educationSchema,
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
export type Experience = z.infer<typeof experienceSchema>;
export type RenderedExperience = z.infer<typeof renderedExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
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

export function parseResumeData(input: unknown): ResumeData {
  return resumeDataSchema.parse(input);
}

export function defaultVersionId(slot: VersionedText): string {
  const selected = slot.versions.find((version) => version.defaultSelected);
  return (selected ?? slot.versions[0])?.id ?? "";
}

export function selectedVersion(
  slot: VersionedText,
  selectedId: string | undefined
): TextVersion | undefined {
  return (
    slot.versions.find((version) => version.id === selectedId) ??
    slot.versions.find((version) => version.id === defaultVersionId(slot))
  );
}
