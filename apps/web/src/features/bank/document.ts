import type {
  PersonalInfo,
  ResumeData,
  ResumeSection,
  SectionEntry,
  TextVersion,
  VersionedText,
} from "@winnow/core";

export type EditorSelection =
  | { type: "personal" }
  | { type: "summary" }
  | { type: "skills" }
  | { type: "entry"; sectionId: string; entryId: string };

export type SlotAddress =
  | { kind: "summary" }
  | { kind: "bullet"; sectionId: string; entryId: string; bulletId: string }
  | { kind: "highlight"; sectionId: string; entryId: string };

export function createId() {
  return crypto.randomUUID();
}

export function sectionKey(section: ResumeSection): string {
  return section.kind === "entries" ? section.id : section.kind;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

function blankVersion(label: string): TextVersion {
  return {
    id: createId(),
    label,
    text: "",
    defaultSelected: false,
  };
}

function ensureDefault(versions: TextVersion[]): TextVersion[] {
  if (
    versions.length === 0 ||
    versions.some((version) => version.defaultSelected)
  ) {
    return versions;
  }
  const [first, ...rest] = versions;
  if (!first) return versions;
  return [{ ...first, defaultSelected: true }, ...rest];
}

function mapEntries(
  data: ResumeData,
  sectionId: string,
  map: (entries: SectionEntry[]) => SectionEntry[],
): ResumeData {
  return {
    ...data,
    sections: data.sections.map((section) => {
      if (section.kind !== "entries" || section.id !== sectionId)
        return section;
      return { ...section, entries: map(section.entries) };
    }),
  };
}

function mapSlot(
  data: ResumeData,
  address: SlotAddress,
  map: (slot: VersionedText) => VersionedText,
): ResumeData {
  if (address.kind === "summary") {
    return { ...data, summary: map(data.summary) };
  }
  return mapEntries(data, address.sectionId, (entries) =>
    entries.map((entry) => {
      if (entry.id !== address.entryId) return entry;
      if (address.kind === "highlight") {
        const next = map({
          id: entry.id,
          defaultChecked: entry.defaultChecked,
          versions: entry.versions ?? [],
        });
        return {
          ...entry,
          defaultChecked: next.defaultChecked,
          versions: next.versions,
        };
      }
      return {
        ...entry,
        bullets: (entry.bullets ?? []).map((bullet) =>
          bullet.id === address.bulletId ? map(bullet) : bullet,
        ),
      };
    }),
  );
}

export function updatePersonal(
  data: ResumeData,
  key: keyof PersonalInfo,
  value: string,
): ResumeData {
  return {
    ...data,
    personalInfo: { ...data.personalInfo, [key]: value },
  };
}

export function renameSection(
  data: ResumeData,
  key: string,
  title: string,
): ResumeData {
  return {
    ...data,
    sections: data.sections.map((section) =>
      sectionKey(section) === key ? { ...section, title } : section,
    ),
  };
}

export function reorderSections(
  data: ResumeData,
  activeKey: string,
  overKey: string,
): ResumeData {
  const from = data.sections.findIndex(
    (section) => sectionKey(section) === activeKey,
  );
  const to = data.sections.findIndex(
    (section) => sectionKey(section) === overKey,
  );
  return { ...data, sections: moveItem(data.sections, from, to) };
}

export function addEntriesSection(
  data: ResumeData,
  title: string,
): { data: ResumeData; selection: EditorSelection } {
  const sectionId = createId();
  const entryId = createId();
  const section: ResumeSection = {
    kind: "entries",
    id: sectionId,
    title,
    entries: [
      {
        id: entryId,
        bullets: [
          {
            id: createId(),
            defaultChecked: true,
            versions: [{ ...blankVersion("Default"), defaultSelected: true }],
          },
        ],
      },
    ],
  };
  return {
    data: { ...data, sections: [...data.sections, section] },
    selection: { type: "entry", sectionId, entryId },
  };
}

export function removeSection(data: ResumeData, sectionId: string): ResumeData {
  return {
    ...data,
    sections: data.sections.filter(
      (section) => section.kind !== "entries" || section.id !== sectionId,
    ),
  };
}

type EntryShape = "bullets" | "versions" | "header";

function shapeOf(entry: SectionEntry): EntryShape {
  if ((entry.bullets?.length ?? 0) > 0) return "bullets";
  if ((entry.versions?.length ?? 0) > 0) return "versions";
  return "header";
}

function blankEntry(shape: EntryShape): SectionEntry {
  const id = createId();
  if (shape === "versions") {
    return {
      id,
      defaultChecked: true,
      versions: [{ ...blankVersion("Default"), defaultSelected: true }],
    };
  }
  if (shape === "bullets") {
    return {
      id,
      bullets: [
        {
          id: createId(),
          defaultChecked: true,
          versions: [{ ...blankVersion("Default"), defaultSelected: true }],
        },
      ],
    };
  }
  return { id };
}

export function addEntry(
  data: ResumeData,
  sectionId: string,
): { data: ResumeData; entryId: string } | null {
  const section = data.sections.find(
    (item) => item.kind === "entries" && item.id === sectionId,
  );
  if (section?.kind !== "entries") return null;
  const shape = section.entries.some((entry) => shapeOf(entry) === "bullets")
    ? "bullets"
    : section.entries.some((entry) => shapeOf(entry) === "versions")
      ? "versions"
      : "header";
  const entry = blankEntry(shape);
  return {
    data: mapEntries(data, sectionId, (entries) => [...entries, entry]),
    entryId: entry.id,
  };
}

export function removeEntry(
  data: ResumeData,
  sectionId: string,
  entryId: string,
): ResumeData {
  return mapEntries(data, sectionId, (entries) =>
    entries.filter((entry) => entry.id !== entryId),
  );
}

export function reorderEntries(
  data: ResumeData,
  sectionId: string,
  activeId: string,
  overId: string,
): ResumeData {
  return mapEntries(data, sectionId, (entries) =>
    moveItem(
      entries,
      entries.findIndex((entry) => entry.id === activeId),
      entries.findIndex((entry) => entry.id === overId),
    ),
  );
}

export function updateEntry(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  patch: Partial<
    Pick<
      SectionEntry,
      "organization" | "title" | "period" | "url" | "alternativeTitles"
    >
  >,
): ResumeData {
  return mapEntries(data, sectionId, (entries) =>
    entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...patch } : entry,
    ),
  );
}

export function updateVersionText(
  data: ResumeData,
  address: SlotAddress,
  versionId: string,
  text: string,
): ResumeData {
  return mapSlot(data, address, (slot) => ({
    ...slot,
    versions: slot.versions.map((version) =>
      version.id === versionId ? { ...version, text } : version,
    ),
  }));
}

export function renameVersion(
  data: ResumeData,
  address: SlotAddress,
  versionId: string,
  label: string,
): ResumeData {
  return mapSlot(data, address, (slot) => ({
    ...slot,
    versions: slot.versions.map((version) =>
      version.id === versionId ? { ...version, label } : version,
    ),
  }));
}

export function setDefaultVersion(
  data: ResumeData,
  address: SlotAddress,
  versionId: string,
): ResumeData {
  return mapSlot(data, address, (slot) => ({
    ...slot,
    versions: slot.versions.map((version) => ({
      ...version,
      defaultSelected: version.id === versionId,
    })),
  }));
}

export function reorderVersions(
  data: ResumeData,
  address: SlotAddress,
  activeId: string,
  overId: string,
): ResumeData {
  return mapSlot(data, address, (slot) => ({
    ...slot,
    versions: moveItem(
      slot.versions,
      slot.versions.findIndex((version) => version.id === activeId),
      slot.versions.findIndex((version) => version.id === overId),
    ),
  }));
}

export function addVersion(
  data: ResumeData,
  address: SlotAddress,
  afterVersionId: string,
): { data: ResumeData; versionId: string } {
  const version = blankVersion("New");
  return {
    versionId: version.id,
    data: mapSlot(data, address, (slot) => {
      const index = slot.versions.findIndex(
        (item) => item.id === afterVersionId,
      );
      const versions = [...slot.versions];
      versions.splice(index + 1, 0, version);
      return { ...slot, versions: ensureDefault(versions) };
    }),
  };
}

export function removeVersion(
  data: ResumeData,
  address: SlotAddress,
  versionId: string,
): ResumeData {
  return mapSlot(data, address, (slot) => {
    if (slot.versions.length < 2) return slot;
    const versions = ensureDefault(
      slot.versions.filter((version) => version.id !== versionId),
    );
    return { ...slot, versions };
  });
}

export function addBullet(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  afterBulletId?: string,
): { data: ResumeData; bulletId: string; versionId: string } | null {
  const version = { ...blankVersion("Default"), defaultSelected: true };
  const bullet: VersionedText = {
    id: createId(),
    defaultChecked: true,
    versions: [version],
  };
  let found = false;
  const next = mapEntries(data, sectionId, (entries) =>
    entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      found = true;
      if ((entry.versions?.length ?? 0) > 0 && !entry.bullets?.length) {
        const converted: VersionedText = {
          id: createId(),
          defaultChecked: entry.defaultChecked ?? true,
          versions: entry.versions ?? [],
        };
        const rest = { ...entry };
        delete rest.versions;
        delete rest.defaultChecked;
        return { ...rest, bullets: [converted, bullet] };
      }
      const bullets = [...(entry.bullets ?? [])];
      const index = afterBulletId
        ? bullets.findIndex((item) => item.id === afterBulletId)
        : bullets.length - 1;
      bullets.splice(index + 1, 0, bullet);
      return { ...entry, bullets };
    }),
  );
  if (!found) return null;
  return { data: next, bulletId: bullet.id, versionId: version.id };
}

export function removeBullet(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  bulletId: string,
): ResumeData {
  return mapEntries(data, sectionId, (entries) =>
    entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      const bullets = (entry.bullets ?? []).filter(
        (bullet) => bullet.id !== bulletId,
      );
      if (bullets.length === 0) {
        const rest = { ...entry };
        delete rest.bullets;
        return rest;
      }
      return { ...entry, bullets };
    }),
  );
}

export function reorderBullets(
  data: ResumeData,
  sectionId: string,
  entryId: string,
  activeId: string,
  overId: string,
): ResumeData {
  return mapEntries(data, sectionId, (entries) =>
    entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      const bullets = entry.bullets ?? [];
      return {
        ...entry,
        bullets: moveItem(
          bullets,
          bullets.findIndex((bullet) => bullet.id === activeId),
          bullets.findIndex((bullet) => bullet.id === overId),
        ),
      };
    }),
  );
}

export function addCategory(
  data: ResumeData,
  label: string,
): { data: ResumeData; categoryId: string } {
  const categoryId = createId();
  return {
    categoryId,
    data: {
      ...data,
      skillCategories: [...data.skillCategories, { id: categoryId, label }],
    },
  };
}

export function renameCategory(
  data: ResumeData,
  categoryId: string,
  label: string,
): ResumeData {
  return {
    ...data,
    skillCategories: data.skillCategories.map((category) =>
      category.id === categoryId ? { ...category, label } : category,
    ),
  };
}

export function removeCategory(
  data: ResumeData,
  categoryId: string,
): ResumeData {
  return {
    ...data,
    skillCategories: data.skillCategories.filter(
      (category) => category.id !== categoryId,
    ),
    skills: data.skills.map((skill) =>
      skill.defaultCategoryId === categoryId
        ? { ...skill, defaultCategoryId: null }
        : skill,
    ),
  };
}

export function addSkill(
  data: ResumeData,
  categoryId: string | null,
): { data: ResumeData; skillId: string } {
  const skillId = createId();
  return {
    skillId,
    data: {
      ...data,
      skills: [
        ...data.skills,
        {
          id: skillId,
          name: "",
          defaultChecked: true,
          defaultCategoryId: categoryId,
        },
      ],
    },
  };
}

export function renameSkill(
  data: ResumeData,
  skillId: string,
  name: string,
): ResumeData {
  return {
    ...data,
    skills: data.skills.map((skill) =>
      skill.id === skillId ? { ...skill, name } : skill,
    ),
  };
}

export function removeSkill(data: ResumeData, skillId: string): ResumeData {
  return {
    ...data,
    skills: data.skills.filter((skill) => skill.id !== skillId),
  };
}

export function placeSkill(
  data: ResumeData,
  skillId: string,
  categoryId: string | null,
  beforeSkillId: string | null,
): ResumeData {
  const skill = data.skills.find((item) => item.id === skillId);
  if (!skill) return data;
  const moved = { ...skill, defaultCategoryId: categoryId };
  const others = data.skills.filter((item) => item.id !== skillId);
  const column = others.filter(
    (item) => (item.defaultCategoryId ?? null) === categoryId,
  );
  const found = beforeSkillId
    ? column.findIndex((item) => item.id === beforeSkillId)
    : -1;
  const safeAt = found < 0 ? column.length : found;
  column.splice(safeAt, 0, moved);
  const without = others.filter(
    (item) => (item.defaultCategoryId ?? null) !== categoryId,
  );
  const first = others.findIndex(
    (item) => (item.defaultCategoryId ?? null) === categoryId,
  );
  const at =
    first === -1
      ? without.length
      : others
          .slice(0, first)
          .filter((item) => (item.defaultCategoryId ?? null) !== categoryId)
          .length;
  const skills = [...without];
  skills.splice(at, 0, ...column);
  return { ...data, skills };
}
