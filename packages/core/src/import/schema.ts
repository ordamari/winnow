import { z } from "zod";

/** T33 meters this task id. Import stays free until then. */
export const RESUME_IMPORT_TASK = "resume-import";

export const RESUME_IMPORT_MODEL = "gpt-4.1-mini" as const;

const extractedBulletSchema = z.object({
  versions: z.array(z.string()),
  existingSlotId: z.string(),
});

const extractedRoleSchema = z.object({
  organization: z.string(),
  title: z.string(),
  alternativeTitles: z.array(z.string()),
  period: z.string(),
  url: z.string(),
  bullets: z.array(extractedBulletSchema),
});

export const resumeExtractionSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    title: z.string(),
    phone: z.string(),
    email: z.string(),
    linkedin: z.string(),
    github: z.string(),
  }),
  summaries: z.array(z.string()),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
    }),
  ),
  experience: z.array(extractedRoleSchema),
  highlights: z.array(
    z.object({
      versions: z.array(z.string()),
      existingSlotId: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      organization: z.string(),
      title: z.string(),
      period: z.string(),
      url: z.string(),
    }),
  ),
  otherSections: z.array(
    z.object({
      title: z.string(),
      entries: z.array(extractedRoleSchema),
    }),
  ),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;
export type ExtractedRole = z.infer<typeof extractedRoleSchema>;
