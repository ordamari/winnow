import {
  defaultVersionId,
  selectedVersion,
  type RenderedExperience,
  type RenderedText,
  type ResumeData,
  type ResumeSelections,
  type SkillCategoryView,
  type TextVersion,
  type VersionedText,
} from "./schema";

function renderSlot(
  slot: VersionedText,
  selectedVersionById: Record<string, string>
): RenderedText {
  return {
    id: slot.id,
    text: selectedVersion(slot, selectedVersionById[slot.id])?.text ?? "",
  };
}

export function buildInitialSelections(data: ResumeData): ResumeSelections {
  const enabledSkills: Record<string, boolean> = {};
  const skillCategoryId: Record<string, string | null> = {};
  for (const skill of data.skills) {
    enabledSkills[skill.id] = skill.defaultChecked ?? false;
    skillCategoryId[skill.id] = skill.defaultCategoryId;
  }

  const enabledBullets: Record<string, boolean> = {};
  const selectedVersionById: Record<string, string> = {
    [data.summary.id]: defaultVersionId(data.summary),
  };
  for (const exp of data.experience) {
    for (const bullet of exp.bullets) {
      enabledBullets[bullet.id] = bullet.defaultChecked ?? false;
      selectedVersionById[bullet.id] = defaultVersionId(bullet);
    }
  }

  const enabledHighlights: Record<string, boolean> = {};
  for (const highlight of data.technicalHighlights) {
    enabledHighlights[highlight.id] = highlight.defaultChecked ?? false;
    selectedVersionById[highlight.id] = defaultVersionId(highlight);
  }

  const experienceTitles: Record<string, string> = {};
  for (const exp of data.experience) {
    experienceTitles[exp.id] = exp.title;
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

export interface RenderedResume {
  selectedSummary: TextVersion | undefined;
  skillCategories: SkillCategoryView[];
  experience: RenderedExperience[];
  highlights: RenderedText[];
}

export function renderResume(
  data: ResumeData,
  selections: ResumeSelections
): RenderedResume {
  const selectedSummary = selectedVersion(
    data.summary,
    selections.selectedVersionById[data.summary.id]
  );

  const skillCategories = selections.categoryList
    .map((category) => ({
      ...category,
      skills: selections.skillList.filter(
        (skill) =>
          selections.skillCategoryId[skill.id] === category.id &&
          selections.enabledSkills[skill.id]
      ),
    }))
    .filter((category) => category.skills.length > 0);

  const experience = data.experience.map((exp) => ({
    id: exp.id,
    company: exp.company,
    title: selections.experienceTitles[exp.id] ?? exp.title,
    period: exp.period,
    bullets: exp.bullets
      .filter((bullet) => selections.enabledBullets[bullet.id])
      .map((bullet) => renderSlot(bullet, selections.selectedVersionById)),
  }));

  const highlights = data.technicalHighlights
    .filter((highlight) => selections.enabledHighlights[highlight.id])
    .map((highlight) => renderSlot(highlight, selections.selectedVersionById));

  return { selectedSummary, skillCategories, experience, highlights };
}
