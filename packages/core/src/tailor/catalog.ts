import {
  defaultVersionId,
  type ResumeData,
  type ResumeSelections,
  type VersionedText,
} from "../resume/schema";

export interface CatalogVersion {
  id: string;
  label: string;
  text: string;
}

export interface CatalogSlot {
  id: string;
  defaultVersionId: string;
  versions: CatalogVersion[];
}

export interface TailorCatalog {
  summary: CatalogSlot;
  skills: { id: string; name: string; categoryId: string | null }[];
  categories: { id: string; label: string }[];
  experience: {
    id: string;
    company: string;
    allowedTitles: string[];
    bullets: CatalogSlot[];
  }[];
  highlights: CatalogSlot[];
  currentTitle: string;
}

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
  selections: ResumeSelections
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
    experience: data.experience.map((exp) => ({
      id: exp.id,
      company: exp.company,
      allowedTitles: [exp.title, ...exp.alternativeTitles],
      bullets: exp.bullets.map(toCatalogSlot),
    })),
    highlights: data.technicalHighlights.map(toCatalogSlot),
  };
}
