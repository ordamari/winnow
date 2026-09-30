import { z } from "zod";

export const bulletMatchSchema = z.object({
  matchPercent: z.number(),
  reason: z.string(),
});

export const tailorResultSchema = z.object({
  selectedTitle: z.string(),
  selectedVersionById: z.record(z.string(), z.string()),
  experienceTitles: z.record(z.string(), z.string()),
  enabledSkills: z.record(z.string(), z.boolean()),
  enabledBullets: z.record(z.string(), z.boolean()),
  enabledHighlights: z.record(z.string(), z.boolean()),
  skillCategoryId: z.record(z.string(), z.string().nullable()),
  bulletMatches: z.record(z.string(), bulletMatchSchema),
  highlightMatches: z.record(z.string(), bulletMatchSchema),
  jdMatch: bulletMatchSchema,
});

const idEnabledSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});

const idTitleSchema = z.object({
  id: z.string(),
  title: z.string(),
});

const idVersionSchema = z.object({
  id: z.string(),
  versionId: z.string(),
});

const idCategorySchema = z.object({
  id: z.string(),
  categoryId: z.string().nullable(),
});

const bulletMatchItemSchema = z.object({
  id: z.string(),
  matchPercent: z.number(),
  reason: z.string(),
});

export const tailorModelSchema = z.object({
  selectedTitle: z.string(),
  selectedVersions: z.array(idVersionSchema),
  experienceTitles: z.array(idTitleSchema),
  enabledSkills: z.array(idEnabledSchema),
  enabledBullets: z.array(idEnabledSchema),
  enabledHighlights: z.array(idEnabledSchema),
  skillCategoryId: z.array(idCategorySchema),
  bulletMatches: z.array(bulletMatchItemSchema),
  highlightMatches: z.array(bulletMatchItemSchema),
  jdMatch: z.object({
    matchPercent: z.number(),
    reason: z.string(),
  }),
});

export type BulletMatch = z.infer<typeof bulletMatchSchema>;
export type TailorResult = z.infer<typeof tailorResultSchema>;
export type TailorModelOutput = z.infer<typeof tailorModelSchema>;

export const OPENAI_MODELS = [
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
  { id: "gpt-4.1", label: "GPT-4.1" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "o4-mini", label: "o4-mini" },
] as const;

export type OpenAIModelId = (typeof OPENAI_MODELS)[number]["id"];
