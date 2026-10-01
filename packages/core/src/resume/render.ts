import {
  defaultVersionId,
  type RenderedText,
  type ResumeData,
  type ResumeSelections,
  type SectionEntry,
  selectedVersion,
  type SkillCategoryView,
  type TextVersion,
  type VersionedText,
} from "./schema";

function renderSlot(
  slot: VersionedText,
  selectedVersionById: Record<string, string>,
): RenderedText {
  return {
    id: slot.id,
    text: selectedVersion(slot, selectedVersionById[slot.id])?.text ?? "",
  };
}

function entrySections(data: ResumeData) {
  return data.sections.filter((section) => section.kind === "entries");
}

function hasBullets(entry: SectionEntry) {
  return (entry.bullets?.length ?? 0) > 0;
}

function isVersionedText(entry: SectionEntry) {
  return (entry.versions?.length ?? 0) > 0 && !hasBullets(entry);
}

export function buildInitialSelections(data: ResumeData): ResumeSelections {
  const enabledSkills: Record<string, boolean> = {};
  const skillCategoryId: Record<string, string | null> = {};
  for (const skill of data.skills) {
    enabledSkills[skill.id] = skill.defaultChecked ?? false;
    skillCategoryId[skill.id] = skill.defaultCategoryId;
  }

  const enabledBullets: Record<string, boolean> = {};
  const enabledHighlights: Record<string, boolean> = {};
  const experienceTitles: Record<string, string> = {};
  const selectedVersionById: Record<string, string> = {
    [data.summary.id]: defaultVersionId(data.summary),
  };

  for (const section of entrySections(data)) {
    for (const entry of section.entries) {
      if (hasBullets(entry)) {
        experienceTitles[entry.id] = entry.title ?? "";
        for (const bullet of entry.bullets ?? []) {
          enabledBullets[bullet.id] = bullet.defaultChecked ?? false;
          selectedVersionById[bullet.id] = defaultVersionId(bullet);
        }
      } else if (isVersionedText(entry)) {
        enabledHighlights[entry.id] = entry.defaultChecked ?? false;
        selectedVersionById[entry.id] = defaultVersionId({
          id: entry.id,
          versions: entry.versions ?? [],
        });
      }
    }
  }

  return {
    selectedVersionById,
    selectedTitle: data.personalInfo.title,
    enabledSkills,
    enabledBullets,
    enabledHighlights,
    experienceTitles,
    skillList: data.skills.map((skill) => ({ ...skill })),
    categoryList: data.skillCategories.map((category) => ({ ...category })),
    skillCategoryId,
  };
}

export interface RenderedEntry {
  id: string;
  organization?: string;
  title?: string;
  period?: string;
  url?: string;
  bullets: RenderedText[];
}

export interface RenderedSection {
  id: string;
  kind: "summary" | "skills" | "entries";
  title: string;
  entries: RenderedEntry[];
}

export interface RenderedResume {
  selectedSummary: TextVersion | undefined;
  skillCategories: SkillCategoryView[];
  sections: RenderedSection[];
}

function renderedEntry(
  entry: SectionEntry,
  selections: ResumeSelections,
): RenderedEntry | null {
  if (hasBullets(entry)) {
    return {
      id: entry.id,
      organization: entry.organization,
      title: selections.experienceTitles[entry.id] ?? entry.title,
      period: entry.period,
      url: entry.url,
      bullets: (entry.bullets ?? [])
        .filter((bullet) => selections.enabledBullets[bullet.id])
        .map((bullet) => renderSlot(bullet, selections.selectedVersionById)),
    };
  }

  if (isVersionedText(entry)) {
    if (!selections.enabledHighlights[entry.id]) return null;
    return {
      id: entry.id,
      url: entry.url,
      bullets: [
        renderSlot(
          { id: entry.id, versions: entry.versions ?? [] },
          selections.selectedVersionById,
        ),
      ],
    };
  }

  return {
    id: entry.id,
    organization: entry.organization,
    title: entry.title,
    period: entry.period,
    url: entry.url,
    bullets: [],
  };
}

export function renderResume(
  data: ResumeData,
  selections: ResumeSelections,
): RenderedResume {
  const selectedSummary = selectedVersion(
    data.summary,
    selections.selectedVersionById[data.summary.id],
  );

  const skillCategories = selections.categoryList
    .map((category) => ({
      ...category,
      skills: selections.skillList.filter(
        (skill) =>
          selections.skillCategoryId[skill.id] === category.id &&
          selections.enabledSkills[skill.id],
      ),
    }))
    .filter((category) => category.skills.length > 0);

  const sections = data.sections.flatMap((section): RenderedSection[] => {
    if (section.kind === "summary" || section.kind === "skills") {
      return [
        {
          id: section.kind,
          kind: section.kind,
          title: section.title,
          entries: [],
        },
      ];
    }

    const entries = section.entries.flatMap((entry) => {
      const rendered = renderedEntry(entry, selections);
      return rendered ? [rendered] : [];
    });
    if (entries.length === 0) return [];
    return [
      {
        id: section.id,
        kind: "entries",
        title: section.title,
        entries,
      },
    ];
  });

  return { selectedSummary, skillCategories, sections };
}
