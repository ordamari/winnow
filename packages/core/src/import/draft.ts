import { parseResumeData } from "../resume/normalize";
import {
  EDUCATION_SECTION_ID,
  EDUCATION_SECTION_TITLE,
  EXPERIENCE_SECTION_ID,
  EXPERIENCE_SECTION_TITLE,
  HIGHLIGHTS_SECTION_ID,
  HIGHLIGHTS_SECTION_TITLE,
  type ResumeData,
  type ResumeSection,
  type SectionEntry,
  SKILLS_SECTION_TITLE,
  SUMMARY_SECTION_TITLE,
  type TextVersion,
  type VersionedText,
} from "../resume/schema";
import type { ExtractedRole, ResumeExtraction } from "./schema";
import { normalizeImportText } from "./verbatim";

type EntriesSection = Extract<ResumeSection, { kind: "entries" }>;

const STRUCTURAL_SECTION_IDS = new Set([
  EXPERIENCE_SECTION_ID,
  HIGHLIGHTS_SECTION_ID,
  EDUCATION_SECTION_ID,
]);

export type ImportSlot = {
  id: string;
  kind: "summary" | "bullet" | "highlight";
  texts: string[];
  organization: string;
  title: string;
};

export function importSlotCatalog(data: ResumeData): ImportSlot[] {
  const slots: ImportSlot[] = [];
  const summaryTexts = filledTexts(
    data.summary.versions.map((version) => version.text),
  );
  if (summaryTexts.length > 0) {
    slots.push({
      id: data.summary.id,
      kind: "summary",
      texts: summaryTexts,
      organization: "",
      title: "",
    });
  }

  for (const section of data.sections) {
    if (section.kind !== "entries") continue;
    for (const entry of section.entries) {
      const organization = entry.organization ?? "";
      const title = entry.title ?? "";
      for (const bullet of entry.bullets ?? []) {
        const texts = filledTexts(
          bullet.versions.map((version) => version.text),
        );
        if (texts.length === 0) continue;
        slots.push({
          id: bullet.id,
          kind: "bullet",
          texts,
          organization,
          title,
        });
      }
      const texts = filledTexts(
        (entry.versions ?? []).map((version) => version.text),
      );
      if (texts.length === 0) continue;
      slots.push({
        id: entry.id,
        kind: "highlight",
        texts,
        organization,
        title,
      });
    }
  }

  return slots;
}

export function mergeResumeExtraction(options: {
  existing: ResumeData | null;
  extraction: ResumeExtraction;
  createId?: () => string;
}): ResumeData {
  const createId = options.createId ?? newId;
  const data = options.existing
    ? structuredClone(options.existing)
    : blankResume();
  ensureMarkers(data);
  applyPersonal(data, options.extraction);
  appendVersions(data.summary, options.extraction.summaries, createId);
  applySkills(data, options.extraction, createId);

  for (const role of options.extraction.experience) {
    applyBulletedEntry(
      ensureEntriesSection(
        data,
        EXPERIENCE_SECTION_ID,
        EXPERIENCE_SECTION_TITLE,
        "after-summary",
      ),
      data,
      role,
      createId,
    );
  }

  for (const highlight of options.extraction.highlights) {
    applyHighlight(data, highlight, createId);
  }

  for (const school of options.extraction.education) {
    applyEducation(data, school, createId);
  }

  for (const section of options.extraction.otherSections) {
    const title = section.title.trim();
    if (!title) continue;
    const target =
      findCustomSection(data, title) ??
      pushEntriesSection(data, createId(), title);
    for (const role of section.entries) {
      applyBulletedEntry(target, data, role, createId);
    }
  }

  pruneEmpty(data, createId);
  return parseResumeData(data);
}

/** Move one bullet's wordings onto another bullet in the same role. */
export function mergeBulletAsVersion(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  fromBulletId: string,
  toBulletId: string,
): ResumeData {
  if (fromBulletId === toBulletId) return data;
  const next = structuredClone(data);
  const section = next.sections.find(
    (item) => item.kind === "entries" && item.id === sectionId,
  );
  if (!section || section.kind !== "entries") return data;
  const entry = section.entries.find((item) => item.id === entryId);
  const from = entry?.bullets?.find((item) => item.id === fromBulletId);
  const to = entry?.bullets?.find((item) => item.id === toBulletId);
  if (!entry?.bullets || !from || !to) return data;
  appendVersions(
    to,
    from.versions.map((version) => version.text),
    newId,
  );
  entry.bullets = entry.bullets.filter((item) => item.id !== fromBulletId);
  return next;
}

function newId(): string {
  return crypto.randomUUID();
}

function blankResume(): ResumeData {
  return {
    personalInfo: {
      name: "",
      title: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
    },
    summary: { id: "summary", versions: [] },
    skills: [],
    skillCategories: [],
    sections: [
      { kind: "summary", title: SUMMARY_SECTION_TITLE },
      { kind: "skills", title: SKILLS_SECTION_TITLE },
    ],
  };
}

function identity(value: string | undefined): string {
  return normalizeImportText(value ?? "").toLocaleLowerCase();
}

function filledTexts(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function sameText(left: string, right: string): boolean {
  return normalizeImportText(left) === normalizeImportText(right);
}

function appendVersions(
  slot: { versions: TextVersion[] },
  texts: string[],
  createId: () => string,
) {
  for (const text of texts) {
    const cleaned = text.trim();
    if (!normalizeImportText(cleaned)) continue;
    if (slot.versions.some((version) => sameText(version.text, cleaned))) {
      continue;
    }
    const first = slot.versions.length === 0;
    const imported = slot.versions.filter(
      (version) =>
        version.label === "Imported" || version.label.startsWith("Imported "),
    ).length;
    slot.versions.push({
      id: createId(),
      label: first
        ? "Default"
        : imported === 0
          ? "Imported"
          : `Imported ${imported + 1}`,
      text: cleaned,
      defaultSelected: first,
    });
  }
}

function applyPersonal(data: ResumeData, extraction: ResumeExtraction) {
  const fields = [
    "name",
    "title",
    "phone",
    "email",
    "linkedin",
    "github",
  ] as const;
  for (const field of fields) {
    const next = extraction.personalInfo[field].trim();
    if (next) data.personalInfo[field] = next;
  }
}

function applySkills(
  data: ResumeData,
  extraction: ResumeExtraction,
  createId: () => string,
) {
  for (const skill of extraction.skills) {
    const name = skill.name.trim();
    if (!name) continue;
    if (data.skills.some((item) => sameText(item.name, name))) continue;
    const category = skill.category.trim();
    let defaultCategoryId: string | null = null;
    if (category) {
      const found = data.skillCategories.find(
        (item) => identity(item.label) === identity(category),
      );
      if (found) {
        defaultCategoryId = found.id;
      } else {
        defaultCategoryId = createId();
        data.skillCategories.push({ id: defaultCategoryId, label: category });
      }
    }
    data.skills.push({
      id: createId(),
      name,
      defaultChecked: true,
      defaultCategoryId,
    });
  }
}

function applyBulletedEntry(
  section: EntriesSection,
  data: ResumeData,
  role: ExtractedRole,
  createId: () => string,
) {
  const identityEntry = findEntryByIdentity(
    section,
    role.organization,
    role.title,
  );
  const pending: VersionedText[] = [];
  let absorbed = false;

  for (const bullet of role.bullets) {
    const existing = findBullet(data, bullet.existingSlotId);
    if (existing) {
      appendVersions(existing, bullet.versions, createId);
      absorbed = true;
      continue;
    }
    if (identityEntry) {
      const texts = bullet.versions.filter(
        (text) => !entryHasText(identityEntry, text),
      );
      const created = newBullet(texts, createId);
      if (created) {
        identityEntry.bullets = [...(identityEntry.bullets ?? []), created];
        absorbed = true;
      } else if (
        bullet.versions.some((text) => entryHasText(identityEntry, text))
      ) {
        absorbed = true;
      }
      continue;
    }
    const created = newBullet(bullet.versions, createId);
    if (created) pending.push(created);
  }

  if (identityEntry) {
    fillEmpty(identityEntry, role);
    return;
  }
  if (pending.length === 0 && (absorbed || !hasRoleFields(role))) return;
  section.entries.push(roleEntry(role, createId(), pending));
}

function applyHighlight(
  data: ResumeData,
  highlight: { versions: string[]; existingSlotId: string },
  createId: () => string,
) {
  const existing = findHighlight(data, highlight.existingSlotId);
  if (existing) {
    if (!existing.versions) existing.versions = [];
    appendVersions(
      { versions: existing.versions },
      highlight.versions,
      createId,
    );
    return;
  }
  const texts = highlight.versions.filter((text) => !highlightHas(data, text));
  const versions: TextVersion[] = [];
  appendVersions({ versions }, texts, createId);
  if (versions.length === 0) return;
  const entry: SectionEntry = {
    id: createId(),
    defaultChecked: true,
    versions,
  };
  ensureEntriesSection(
    data,
    HIGHLIGHTS_SECTION_ID,
    HIGHLIGHTS_SECTION_TITLE,
    "after-skills",
  ).entries.push(entry);
}

function applyEducation(
  data: ResumeData,
  school: {
    organization: string;
    title: string;
    period: string;
    url: string;
  },
  createId: () => string,
) {
  if (!hasRoleFields({ ...school, alternativeTitles: [] })) return;
  const section = ensureEntriesSection(
    data,
    EDUCATION_SECTION_ID,
    EDUCATION_SECTION_TITLE,
    "after-highlights",
  );
  const found = findEntryByIdentity(section, school.organization, school.title);
  if (found) {
    fillEmpty(found, { ...school, alternativeTitles: [] });
    return;
  }
  section.entries.push(
    roleEntry(
      {
        ...school,
        alternativeTitles: [],
        bullets: [],
      },
      createId(),
      [],
    ),
  );
}

function newBullet(
  texts: string[],
  createId: () => string,
): VersionedText | null {
  const slot: VersionedText = {
    id: createId(),
    defaultChecked: true,
    versions: [],
  };
  appendVersions(slot, texts, createId);
  if (slot.versions.length === 0) return null;
  return slot;
}

function findBullet(data: ResumeData, id: string): VersionedText | null {
  if (!id.trim()) return null;
  for (const section of data.sections) {
    if (section.kind !== "entries") continue;
    for (const entry of section.entries) {
      const bullet = entry.bullets?.find((item) => item.id === id);
      if (bullet) return bullet;
    }
  }
  return null;
}

function findHighlight(data: ResumeData, id: string): SectionEntry | null {
  if (!id.trim()) return null;
  for (const section of data.sections) {
    if (section.kind !== "entries") continue;
    const entry = section.entries.find(
      (item) => item.id === id && item.versions,
    );
    if (entry) return entry;
  }
  return null;
}

function entryHasText(entry: SectionEntry, text: string): boolean {
  const key = normalizeImportText(text);
  if (!key) return false;
  return (entry.bullets ?? []).some((bullet) =>
    bullet.versions.some(
      (version) => normalizeImportText(version.text) === key,
    ),
  );
}

function highlightHas(data: ResumeData, text: string): boolean {
  const key = normalizeImportText(text);
  if (!key) return false;
  for (const section of data.sections) {
    if (section.kind !== "entries" || section.id !== HIGHLIGHTS_SECTION_ID) {
      continue;
    }
    for (const entry of section.entries) {
      if (
        entry.versions?.some(
          (version) => normalizeImportText(version.text) === key,
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function findEntryByIdentity(
  section: EntriesSection,
  organization: string,
  title: string,
): SectionEntry | undefined {
  if (!identity(organization) && !identity(title)) return undefined;
  return section.entries.find(
    (entry) =>
      identity(entry.organization) === identity(organization) &&
      identity(entry.title) === identity(title),
  );
}

function findCustomSection(
  data: ResumeData,
  title: string,
): EntriesSection | undefined {
  const key = identity(title);
  return data.sections.find(
    (section): section is EntriesSection =>
      section.kind === "entries" &&
      !STRUCTURAL_SECTION_IDS.has(section.id) &&
      identity(section.title) === key,
  );
}

function hasRoleFields(role: {
  organization: string;
  title: string;
  alternativeTitles: string[];
  period: string;
  url: string;
}): boolean {
  return (
    role.organization.trim().length > 0 ||
    role.title.trim().length > 0 ||
    role.period.trim().length > 0 ||
    role.url.trim().length > 0 ||
    role.alternativeTitles.some((title) => title.trim().length > 0)
  );
}

function fillEmpty(
  entry: SectionEntry,
  role: {
    period: string;
    url: string;
    alternativeTitles: string[];
  },
) {
  const period = role.period.trim();
  const url = role.url.trim();
  if (!entry.period && period) entry.period = period;
  if (!entry.url && url) entry.url = url;
  const seen = new Set(
    (entry.alternativeTitles ?? []).map((title) => normalizeImportText(title)),
  );
  const added = uniqueTexts(role.alternativeTitles).filter(
    (title) => !seen.has(normalizeImportText(title)),
  );
  if (added.length > 0) {
    entry.alternativeTitles = [...(entry.alternativeTitles ?? []), ...added];
  }
}

function roleEntry(
  role: ExtractedRole,
  id: string,
  bullets: VersionedText[],
): SectionEntry {
  const entry: SectionEntry = { id };
  const organization = role.organization.trim();
  const title = role.title.trim();
  const period = role.period.trim();
  const url = role.url.trim();
  const alternativeTitles = uniqueTexts(role.alternativeTitles);
  if (organization) entry.organization = organization;
  if (title) entry.title = title;
  if (alternativeTitles.length > 0) entry.alternativeTitles = alternativeTitles;
  if (period) entry.period = period;
  if (url) entry.url = url;
  if (bullets.length > 0) entry.bullets = bullets;
  return entry;
}

function uniqueTexts(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = value.trim();
    const key = normalizeImportText(cleaned);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function ensureMarkers(data: ResumeData) {
  if (!data.sections.some((section) => section.kind === "summary")) {
    data.sections.unshift({ kind: "summary", title: SUMMARY_SECTION_TITLE });
  }
  if (!data.sections.some((section) => section.kind === "skills")) {
    const summaryAt = data.sections.findIndex(
      (section) => section.kind === "summary",
    );
    data.sections.splice(summaryAt + 1, 0, {
      kind: "skills",
      title: SKILLS_SECTION_TITLE,
    });
  }
}

function ensureEntriesSection(
  data: ResumeData,
  id: string,
  title: string,
  place: "after-summary" | "after-skills" | "after-highlights",
): EntriesSection {
  const found = data.sections.find(
    (section): section is EntriesSection =>
      section.kind === "entries" && section.id === id,
  );
  if (found) return found;
  const section: EntriesSection = { kind: "entries", id, title, entries: [] };
  const summaryAt = data.sections.findIndex((item) => item.kind === "summary");
  const skillsAt = data.sections.findIndex((item) => item.kind === "skills");
  const highlightsAt = data.sections.findIndex(
    (item) => item.kind === "entries" && item.id === HIGHLIGHTS_SECTION_ID,
  );
  const index =
    place === "after-summary"
      ? Math.max(summaryAt, 0)
      : place === "after-skills"
        ? skillsAt
        : highlightsAt === -1
          ? skillsAt
          : highlightsAt;
  data.sections.splice(
    (index === -1 ? data.sections.length - 1 : index) + 1,
    0,
    section,
  );
  return section;
}

function pushEntriesSection(
  data: ResumeData,
  id: string,
  title: string,
): EntriesSection {
  const section: EntriesSection = { kind: "entries", id, title, entries: [] };
  data.sections.push(section);
  return section;
}

function pruneEmpty(data: ResumeData, createId: () => string) {
  const summary = data.summary.versions.filter((version) =>
    version.text.trim(),
  );
  if (summary.length === 0) {
    data.summary.versions = [
      {
        id: createId(),
        label: "Default",
        text: "",
        defaultSelected: true,
      },
    ];
  } else {
    if (!summary.some((version) => version.defaultSelected)) {
      summary[0] = { ...summary[0], defaultSelected: true };
    }
    data.summary.versions = summary;
  }

  data.skills = data.skills.filter((skill) => skill.name.trim());
  const used = new Set(
    data.skills
      .map((skill) => skill.defaultCategoryId)
      .filter((id): id is string => Boolean(id)),
  );
  data.skillCategories = data.skillCategories.filter(
    (category) => used.has(category.id) && category.label.trim(),
  );
  for (const skill of data.skills) {
    if (
      skill.defaultCategoryId &&
      !data.skillCategories.some(
        (category) => category.id === skill.defaultCategoryId,
      )
    ) {
      skill.defaultCategoryId = null;
    }
  }

  for (const section of data.sections) {
    if (section.kind !== "entries") continue;
    for (const entry of section.entries) {
      if (entry.bullets) {
        entry.bullets = entry.bullets
          .map((bullet) => ({
            ...bullet,
            versions: bullet.versions.filter((version) => version.text.trim()),
          }))
          .filter((bullet) => bullet.versions.length > 0);
        if (entry.bullets.length === 0) delete entry.bullets;
      }
      if (entry.versions) {
        entry.versions = entry.versions.filter((version) =>
          version.text.trim(),
        );
        if (entry.versions.length === 0) {
          delete entry.versions;
          delete entry.defaultChecked;
        }
      }
    }
    section.entries = section.entries.filter((entry) => !isBlankEntry(entry));
  }

  data.sections = data.sections.filter(
    (section) => section.kind !== "entries" || section.entries.length > 0,
  );
}

function isBlankEntry(entry: SectionEntry): boolean {
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
