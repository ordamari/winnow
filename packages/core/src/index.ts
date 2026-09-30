export const productName = "Winnow";

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
export { buildInitialSelections, renderResume } from "./resume/render";
export type { RenderedResume } from "./resume/render";

export { buildTailorCatalog, tailorCatalogSchema } from "./tailor/catalog";
export type {
  CatalogSlot,
  CatalogVersion,
  TailorCatalog,
} from "./tailor/catalog";
export { sanitizeTailorResult } from "./tailor/sanitize";
export {
  JD_MAX_LENGTH,
  OPENAI_MODELS,
  bulletMatchSchema,
  openAIModelIdSchema,
  tailorModelSchema,
  tailorRequestError,
  tailorRequestSchema,
  tailorResultSchema,
} from "./tailor/schema";
export type {
  BulletMatch,
  OpenAIModelId,
  TailorModelOutput,
  TailorRequest,
  TailorRequestErrorCode,
  TailorResult,
} from "./tailor/schema";
