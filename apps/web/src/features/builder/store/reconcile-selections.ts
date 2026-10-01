import {
  buildInitialSelections,
  defaultVersionId,
  type ResumeData,
  type ResumeSelections,
  type VersionedText,
} from "@winnow/core";

function entrySections(data: ResumeData) {
  return data.sections.filter((section) => section.kind === "entries");
}

function slotsOf(data: ResumeData) {
  const slots = new Map<string, VersionedText>();
  slots.set(data.summary.id, data.summary);
  for (const section of entrySections(data)) {
    for (const entry of section.entries) {
      if ((entry.bullets?.length ?? 0) > 0) {
        for (const bullet of entry.bullets ?? []) slots.set(bullet.id, bullet);
      } else if ((entry.versions?.length ?? 0) > 0) {
        slots.set(entry.id, {
          id: entry.id,
          defaultChecked: entry.defaultChecked,
          versions: entry.versions ?? [],
        });
      }
    }
  }
  return slots;
}

export function bulletIds(data: ResumeData) {
  const ids = new Set<string>();
  for (const section of entrySections(data)) {
    for (const entry of section.entries) {
      for (const bullet of entry.bullets ?? []) ids.add(bullet.id);
    }
  }
  return ids;
}

export function highlightIds(data: ResumeData) {
  const ids = new Set<string>();
  for (const section of entrySections(data)) {
    for (const entry of section.entries) {
      if ((entry.bullets?.length ?? 0) > 0) continue;
      if ((entry.versions?.length ?? 0) > 0) ids.add(entry.id);
    }
  }
  return ids;
}

function experienceEntries(data: ResumeData) {
  const entries = new Map<string, { title: string; offered: Set<string> }>();
  for (const section of entrySections(data)) {
    for (const entry of section.entries) {
      if ((entry.bullets?.length ?? 0) === 0) continue;
      const title = entry.title ?? "";
      entries.set(entry.id, {
        title,
        offered: new Set([title, ...(entry.alternativeTitles ?? [])]),
      });
    }
  }
  return entries;
}

function keepFlag(
  id: string,
  session: Record<string, boolean>,
  defaults: Record<string, boolean>,
) {
  return id in session ? session[id] : (defaults[id] ?? false);
}

/**
 * Keeps session choices for ids that still exist, drops ids that are gone,
 * and fills defaults only for ids that are new. A missing version falls back
 * to the slot default. Skill and category labels the user changed (different
 * from the previous bank) stay; every other label comes from the next bank.
 */
export function reconcileSelections(
  previousBank: ResumeData,
  nextBank: ResumeData,
  selections: ResumeSelections,
): ResumeSelections {
  const fresh = buildInitialSelections(nextBank);
  const nextSlots = slotsOf(nextBank);
  const selectedVersionById: Record<string, string> = {};
  for (const [slotId, slot] of nextSlots) {
    const chosen = selections.selectedVersionById[slotId];
    const versionRemains = slot.versions.some(
      (version) => version.id === chosen,
    );
    selectedVersionById[slotId] =
      chosen && versionRemains ? chosen : defaultVersionId(slot);
  }

  const enabledBullets: Record<string, boolean> = {};
  for (const id of bulletIds(nextBank)) {
    enabledBullets[id] = keepFlag(
      id,
      selections.enabledBullets,
      fresh.enabledBullets,
    );
  }

  const enabledHighlights: Record<string, boolean> = {};
  for (const id of highlightIds(nextBank)) {
    enabledHighlights[id] = keepFlag(
      id,
      selections.enabledHighlights,
      fresh.enabledHighlights,
    );
  }

  const previousJobs = experienceEntries(previousBank);
  const experienceTitles: Record<string, string> = {};
  for (const [id, entry] of experienceEntries(nextBank)) {
    const sessionTitle = selections.experienceTitles[id];
    const previousTitle = previousJobs.get(id)?.title;
    const userChose =
      sessionTitle !== undefined &&
      previousTitle !== undefined &&
      sessionTitle !== previousTitle &&
      entry.offered.has(sessionTitle);
    experienceTitles[id] = userChose ? sessionTitle : entry.title;
  }

  const previousSkills = new Map(
    previousBank.skills.map((skill) => [skill.id, skill]),
  );
  const sessionSkills = new Map(
    selections.skillList.map((skill) => [skill.id, skill]),
  );
  const skillList = nextBank.skills.map((skill) => {
    const previous = previousSkills.get(skill.id);
    const session = sessionSkills.get(skill.id);
    const name =
      session && previous && session.name !== previous.name
        ? session.name
        : skill.name;
    return { ...skill, name };
  });

  const previousCategories = new Map(
    previousBank.skillCategories.map((category) => [category.id, category]),
  );
  const sessionCategories = new Map(
    selections.categoryList.map((category) => [category.id, category]),
  );
  const nextCategoryIds = new Set(
    nextBank.skillCategories.map((category) => category.id),
  );
  const categoryList = [
    ...nextBank.skillCategories.map((category) => {
      const previous = previousCategories.get(category.id);
      const session = sessionCategories.get(category.id);
      const label =
        session && previous && session.label !== previous.label
          ? session.label
          : category.label;
      return { ...category, label };
    }),
    ...selections.categoryList.filter(
      (category) =>
        !nextCategoryIds.has(category.id) &&
        !previousCategories.has(category.id),
    ),
  ];
  const categoryIds = new Set(categoryList.map((category) => category.id));

  const enabledSkills: Record<string, boolean> = {};
  const skillCategoryId: Record<string, string | null> = {};
  for (const skill of nextBank.skills) {
    enabledSkills[skill.id] = keepFlag(
      skill.id,
      selections.enabledSkills,
      fresh.enabledSkills,
    );
    const assigned = selections.skillCategoryId[skill.id];
    if (
      skill.id in selections.skillCategoryId &&
      (assigned === null ||
        (assigned !== undefined && categoryIds.has(assigned)))
    ) {
      skillCategoryId[skill.id] = assigned;
    } else {
      const fallback = skill.defaultCategoryId;
      skillCategoryId[skill.id] =
        fallback && categoryIds.has(fallback) ? fallback : null;
    }
  }

  const selectedTitle =
    selections.selectedTitle === previousBank.personalInfo.title
      ? nextBank.personalInfo.title
      : selections.selectedTitle;

  return {
    selectedVersionById,
    selectedTitle,
    enabledSkills,
    enabledBullets,
    enabledHighlights,
    experienceTitles,
    skillList,
    categoryList,
    skillCategoryId,
  };
}
