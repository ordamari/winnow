import type {
  PersonalInfo,
  ResumeData,
  SectionEntry,
  TextVersion,
  VersionedText,
} from "@winnow/core";

function mapEntries(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  update: (entry: SectionEntry) => SectionEntry | null,
): ResumeData {
  return {
    ...data,
    sections: data.sections
      .map((section) => {
        if (section.kind !== "entries" || section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          entries: section.entries
            .map((entry) => (entry.id === entryId ? update(entry) : entry))
            .filter((entry): entry is SectionEntry => entry !== null),
        };
      })
      .filter(
        (section) => section.kind !== "entries" || section.entries.length > 0,
      ),
  };
}

function isBlank(entry: SectionEntry): boolean {
  return (
    !entry.organization?.trim() &&
    !entry.title?.trim() &&
    !entry.period?.trim() &&
    !entry.url?.trim() &&
    !(entry.alternativeTitles ?? []).some((title) => title.trim()) &&
    !(entry.bullets ?? []).length &&
    !(entry.versions ?? []).length
  );
}

function keepVersions(
  versions: TextVersion[],
  versionId: string,
): TextVersion[] {
  const next = versions.filter((version) => version.id !== versionId);
  if (next.length > 0 && !next.some((version) => version.defaultSelected)) {
    next[0] = { ...next[0], defaultSelected: true };
  }
  return next;
}

export function setPersonalField(
  data: ResumeData,
  field: keyof PersonalInfo,
  value: string,
): ResumeData {
  return {
    ...data,
    personalInfo: { ...data.personalInfo, [field]: value },
  };
}

export function setSummaryText(
  data: ResumeData,
  versionId: string,
  value: string,
): ResumeData {
  return {
    ...data,
    summary: {
      ...data.summary,
      versions: data.summary.versions.map((version) =>
        version.id === versionId ? { ...version, text: value } : version,
      ),
    },
  };
}

export function removeSummaryVersion(
  data: ResumeData,
  versionId: string,
): ResumeData {
  if (data.summary.versions.length <= 1) {
    return setSummaryText(data, versionId, "");
  }
  const versions = keepVersions(data.summary.versions, versionId);
  return { ...data, summary: { ...data.summary, versions } };
}

export function setSkillName(
  data: ResumeData,
  skillId: string,
  value: string,
): ResumeData {
  return {
    ...data,
    skills: data.skills.map((skill) =>
      skill.id === skillId ? { ...skill, name: value } : skill,
    ),
  };
}

export function removeSkill(data: ResumeData, skillId: string): ResumeData {
  return {
    ...data,
    skills: data.skills.filter((skill) => skill.id !== skillId),
  };
}

export function setCategoryLabel(
  data: ResumeData,
  categoryId: string,
  value: string,
): ResumeData {
  return {
    ...data,
    skillCategories: data.skillCategories.map((category) =>
      category.id === categoryId ? { ...category, label: value } : category,
    ),
  };
}

export function setSectionTitle(
  data: ResumeData,
  sectionId: string,
  value: string,
): ResumeData {
  return {
    ...data,
    sections: data.sections.map((section) =>
      section.kind === "entries" && section.id === sectionId
        ? { ...section, title: value }
        : section,
    ),
  };
}

export function setEntryField(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  field: "organization" | "title" | "period" | "url",
  value: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => ({
    ...entry,
    [field]: value,
  }));
}

export function setAlternativeTitle(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  index: number,
  value: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => ({
    ...entry,
    alternativeTitles: (entry.alternativeTitles ?? []).map((title, item) =>
      item === index ? value : title,
    ),
  }));
}

export function removeAlternativeTitle(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  index: number,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => {
    const alternativeTitles = (entry.alternativeTitles ?? []).filter(
      (_title, item) => item !== index,
    );
    const next: SectionEntry = { ...entry };
    if (alternativeTitles.length === 0) delete next.alternativeTitles;
    else next.alternativeTitles = alternativeTitles;
    return isBlank(next) ? null : next;
  });
}

export function setEntryVersionText(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  versionId: string,
  value: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => ({
    ...entry,
    versions: (entry.versions ?? []).map((version) =>
      version.id === versionId ? { ...version, text: value } : version,
    ),
  }));
}

export function removeEntryVersion(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  versionId: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => {
    const versions = keepVersions(entry.versions ?? [], versionId);
    const next: SectionEntry = { ...entry };
    if (versions.length === 0) {
      delete next.versions;
      delete next.defaultChecked;
    } else {
      next.versions = versions;
    }
    return isBlank(next) ? null : next;
  });
}

export function setBulletVersionText(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  bulletId: string,
  versionId: string,
  value: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => ({
    ...entry,
    bullets: (entry.bullets ?? []).map((bullet) =>
      bullet.id === bulletId
        ? {
            ...bullet,
            versions: bullet.versions.map((version) =>
              version.id === versionId ? { ...version, text: value } : version,
            ),
          }
        : bullet,
    ),
  }));
}

export function removeBullet(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  bulletId: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => {
    const bullets = (entry.bullets ?? []).filter(
      (bullet) => bullet.id !== bulletId,
    );
    const next: SectionEntry = { ...entry };
    if (bullets.length === 0) delete next.bullets;
    else next.bullets = bullets;
    return isBlank(next) ? null : next;
  });
}

export function removeBulletVersion(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  bulletId: string,
  versionId: string,
): ResumeData {
  return mapEntries(data, sectionId, entryId, (entry) => {
    const bullets = (entry.bullets ?? [])
      .map((bullet) => {
        if (bullet.id !== bulletId) return bullet;
        const versions = keepVersions(bullet.versions, versionId);
        if (versions.length === 0) return null;
        return { ...bullet, versions };
      })
      .filter((bullet): bullet is VersionedText => bullet !== null);
    const next: SectionEntry = { ...entry };
    if (bullets.length === 0) delete next.bullets;
    else next.bullets = bullets;
    return isBlank(next) ? null : next;
  });
}
