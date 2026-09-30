export const productName = "Winnow";

export type { RenderedResume } from "./resume/render";
export { buildInitialSelections, renderResume } from "./resume/render";
export type {
  Education,
  Experience,
  PersonalInfo,
  RenderedExperience,
  RenderedText,
  ResumeData,
  ResumeSelections,
  ResumeStyle,
  Skill,
  SkillCategory,
  SkillCategoryView,
  TextVersion,
  VersionedText,
} from "./resume/schema";
export {
  DEFAULT_STYLE,
  defaultVersionId,
  educationSchema,
  experienceSchema,
  fontFamilySchema,
  parseResumeData,
  personalInfoSchema,
  renderedExperienceSchema,
  renderedTextSchema,
  resumeDataSchema,
  resumeSelectionsSchema,
  resumeStyleSchema,
  selectedVersion,
  skillCategorySchema,
  skillCategoryViewSchema,
  skillSchema,
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
