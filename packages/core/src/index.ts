export const productName = "Winnow";

export {
  exportResumeData,
  parseResumeData,
  summarizeResume,
} from "./resume/normalize";
export type {
  RenderedEntry,
  RenderedResume,
  RenderedSection,
} from "./resume/render";
export { buildInitialSelections, renderResume } from "./resume/render";
export type {
  PersonalInfo,
  RenderedText,
  ResumeData,
  ResumeSection,
  ResumeSelections,
  ResumeStyle,
  SectionEntry,
  Skill,
  SkillCategory,
  SkillCategoryView,
  TextVersion,
  VersionedText,
} from "./resume/schema";
export {
  DEFAULT_STYLE,
  defaultVersionId,
  EDUCATION_SECTION_ID,
  EDUCATION_SECTION_TITLE,
  EXPERIENCE_SECTION_ID,
  EXPERIENCE_SECTION_TITLE,
  fontFamilySchema,
  HIGHLIGHTS_SECTION_ID,
  HIGHLIGHTS_SECTION_TITLE,
  personalInfoSchema,
  renderedTextSchema,
  resumeDataSchema,
  resumeSectionSchema,
  resumeSelectionsSchema,
  resumeStyleSchema,
  sectionEntrySchema,
  selectedVersion,
  skillCategorySchema,
  skillCategoryViewSchema,
  SKILLS_SECTION_TITLE,
  skillSchema,
  SUMMARY_SECTION_TITLE,
  textVersionSchema,
  versionedTextSchema,
} from "./resume/schema";
export type {
  CatalogSlot,
  CatalogVersion,
  TailorCatalog,
} from "./tailor/catalog";
export { buildTailorCatalog, tailorCatalogSchema } from "./tailor/catalog";
export { sanitizeTailorResult } from "./tailor/sanitize";
export type {
  BulletMatch,
  OpenAIModelId,
  TailorModelOutput,
  TailorRequest,
  TailorRequestErrorCode,
  TailorResult,
} from "./tailor/schema";
export {
  bulletMatchSchema,
  JD_MAX_LENGTH,
  OPENAI_MODELS,
  openAIModelIdSchema,
  tailorModelSchema,
  tailorRequestError,
  tailorRequestSchema,
  tailorResultSchema,
} from "./tailor/schema";
