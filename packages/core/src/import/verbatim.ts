import {
  EDUCATION_SECTION_ID,
  EXPERIENCE_SECTION_ID,
  HIGHLIGHTS_SECTION_ID,
  type PersonalInfo,
  type ResumeData,
} from "../resume/schema";

const STRUCTURAL_SECTION_IDS = new Set([
  EXPERIENCE_SECTION_ID,
  HIGHLIGHTS_SECTION_ID,
  EDUCATION_SECTION_ID,
]);

const PERSONAL_FIELDS = [
  "name",
  "title",
  "phone",
  "email",
  "linkedin",
  "github",
] as const satisfies readonly (keyof PersonalInfo)[];

export type ImportFlag = {
  path: string;
  text: string;
};

export function personalImportPath(field: keyof PersonalInfo): string {
  return `personalInfo.${field}`;
}

export function summaryImportPath(versionId: string): string {
  return `summary.versions.${versionId}.text`;
}

export function skillImportPath(skillId: string): string {
  return `skills.${skillId}.name`;
}

export function categoryImportPath(categoryId: string): string {
  return `skillCategories.${categoryId}.label`;
}

export function sectionTitleImportPath(sectionId: string): string {
  return `sections.${sectionId}.title`;
}

export function entryImportPath(
  sectionId: string,
  entryId: string,
  field: "organization" | "title" | "period" | "url",
): string {
  return `sections.${sectionId}.entries.${entryId}.${field}`;
}

export function alternativeTitleImportPath(
  sectionId: string,
  entryId: string,
  index: number,
): string {
  return `sections.${sectionId}.entries.${entryId}.alternativeTitles.${index}`;
}

export function entryVersionImportPath(
  sectionId: string,
  entryId: string,
  versionId: string,
): string {
  return `sections.${sectionId}.entries.${entryId}.versions.${versionId}.text`;
}

export function bulletImportPath(
  sectionId: string,
  entryId: string,
  bulletId: string,
  versionId: string,
): string {
  return `sections.${sectionId}.entries.${entryId}.bullets.${bulletId}.versions.${versionId}.text`;
}

/** NFKC, collapsed whitespace, and leading bullet characters removed. */
export function normalizeImportText(value: string): string {
  return value
    .normalize("NFKC")
    .split(/\r?\n/)
    .map(stripLeadingBullet)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingBullet(line: string): string {
  const withoutGlyph = line.replace(/^[\t ]*[•◦▪▸‣∙·]+\s*/, "");
  return withoutGlyph.replace(/^[\t ]*[-*–—]\s+/, "");
}

export function textAppearsInSource(source: string, text: string): boolean {
  const needle = normalizeImportText(text);
  if (!needle) return true;
  return normalizeImportText(source).includes(needle);
}

export function collectImportTexts(data: ResumeData): string[] {
  return walkImportTexts(data).map((item) => item.text);
}

export function importFlags(source: string, data: ResumeData): ImportFlag[] {
  return walkImportTexts(data).filter(
    (item) => !textAppearsInSource(source, item.text),
  );
}

export function combineImportSource(
  sourceText: string,
  existing: ResumeData | null,
): string {
  if (!existing) return sourceText;
  return [sourceText, ...collectImportTexts(existing)].join("\n");
}

function walkImportTexts(data: ResumeData): ImportFlag[] {
  const items: ImportFlag[] = [];

  function consider(path: string, text: string | undefined) {
    if (!text?.trim()) return;
    items.push({ path, text });
  }

  for (const field of PERSONAL_FIELDS) {
    consider(personalImportPath(field), data.personalInfo[field]);
  }

  for (const version of data.summary.versions) {
    consider(summaryImportPath(version.id), version.text);
  }

  for (const category of data.skillCategories) {
    consider(categoryImportPath(category.id), category.label);
  }

  for (const skill of data.skills) {
    consider(skillImportPath(skill.id), skill.name);
  }

  for (const section of data.sections) {
    if (section.kind !== "entries") continue;
    if (!STRUCTURAL_SECTION_IDS.has(section.id)) {
      consider(sectionTitleImportPath(section.id), section.title);
    }
    for (const entry of section.entries) {
      consider(
        entryImportPath(section.id, entry.id, "organization"),
        entry.organization,
      );
      consider(entryImportPath(section.id, entry.id, "title"), entry.title);
      consider(entryImportPath(section.id, entry.id, "period"), entry.period);
      consider(entryImportPath(section.id, entry.id, "url"), entry.url);
      entry.alternativeTitles?.forEach((title, index) => {
        consider(
          alternativeTitleImportPath(section.id, entry.id, index),
          title,
        );
      });
      entry.versions?.forEach((version) => {
        consider(
          entryVersionImportPath(section.id, entry.id, version.id),
          version.text,
        );
      });
      entry.bullets?.forEach((bullet) => {
        bullet.versions.forEach((version) => {
          consider(
            bulletImportPath(section.id, entry.id, bullet.id, version.id),
            version.text,
          );
        });
      });
    }
  }

  return items;
}
