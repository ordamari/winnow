import { z } from "zod";

import {
  defaultVersionId,
  type ResumeData,
  type ResumeSelections,
  type VersionedText,
} from "../resume/schema";

const catalogVersionSchema = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string(),
});

const catalogSlotSchema = z.object({
  id: z.string(),
  defaultVersionId: z.string(),
  versions: z.array(catalogVersionSchema).max(12),
});

const catalogSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string().nullable(),
});

const catalogCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
});

const catalogExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  allowedTitles: z.array(z.string()),
  bullets: z.array(catalogSlotSchema).max(40),
});

export const tailorCatalogSchema = z.object({
  summary: catalogSlotSchema,
  skills: z.array(catalogSkillSchema).max(200),
  categories: z.array(catalogCategorySchema).max(40),
  experience: z.array(catalogExperienceSchema).max(30),
  highlights: z.array(catalogSlotSchema).max(40),
  currentTitle: z.string(),
});

export type CatalogVersion = z.infer<typeof catalogVersionSchema>;
export type CatalogSlot = z.infer<typeof catalogSlotSchema>;
export type TailorCatalog = z.infer<typeof tailorCatalogSchema>;

function toCatalogSlot(slot: VersionedText): CatalogSlot {
  return {
    id: slot.id,
    defaultVersionId: defaultVersionId(slot),
    versions: slot.versions.map((version) => ({
      id: version.id,
      label: version.label,
      text: version.text.replace(/\*\*/g, ""),
    })),
  };
}

export function buildTailorCatalog(
  data: ResumeData,
  selections: ResumeSelections,
): TailorCatalog {
  return {
    currentTitle: selections.selectedTitle,
    summary: toCatalogSlot(data.summary),
    skills: selections.skillList.map((skill) => ({
      id: skill.id,
      name: skill.name,
      categoryId: selections.skillCategoryId[skill.id] ?? null,
    })),
    categories: selections.categoryList.map((category) => ({
      id: category.id,
      label: category.label,
    })),
    experience: data.sections.flatMap((section) => {
      if (section.kind !== "entries") return [];
      return section.entries.flatMap((entry) => {
        if (!entry.bullets?.length) return [];
        const title = entry.title ?? "";
        const allowedTitles = [
          title,
          ...(entry.alternativeTitles ?? []),
        ].filter((item) => item.length > 0);
        return [
          {
            id: entry.id,
            company: entry.organization ?? "",
            allowedTitles,
            bullets: entry.bullets.map(toCatalogSlot),
          },
        ];
      });
    }),
    highlights: data.sections.flatMap((section) => {
      if (section.kind !== "entries") return [];
      return section.entries.flatMap((entry) => {
        if (entry.bullets?.length || !entry.versions?.length) return [];
        return [
          toCatalogSlot({
            id: entry.id,
            defaultChecked: entry.defaultChecked,
            versions: entry.versions,
          }),
        ];
      });
    }),
  };
}
