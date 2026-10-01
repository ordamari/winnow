import { randomUUID } from "node:crypto";

import {
  exportResumeData,
  type ResumeData,
  type SectionEntry,
  type TextVersion,
} from "@winnow/core";
import { and, eq, isNull } from "drizzle-orm";

import { ownedBy } from "../auth/ownership";
import type { Database } from "../db/connection";
import {
  banks,
  personalInfo,
  sectionEntries,
  sections,
  skillCategories,
  skills,
  slots,
  slotVersions,
} from "../db/schema";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class BankConflictError extends Error {
  constructor() {
    super("Bank was updated somewhere else");
    this.name = "BankConflictError";
  }
}

export type LoadedBank = {
  data: ResumeData;
  updatedAt: string;
};

function byPosition<T extends { position: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

function toVersions(
  rows: {
    publicId: string;
    label: string;
    text: string;
    defaultSelected: boolean;
    position: number;
  }[],
): TextVersion[] {
  return byPosition(rows).map((row) => ({
    id: row.publicId,
    label: row.label,
    text: row.text,
    defaultSelected: row.defaultSelected,
  }));
}

async function hideLiveRows(
  tx: Tx,
  table:
    | typeof personalInfo
    | typeof sections
    | typeof sectionEntries
    | typeof slots
    | typeof slotVersions
    | typeof skillCategories
    | typeof skills,
  bankId: string,
) {
  await tx
    .update(table)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(table.bankId, bankId), isNull(table.deletedAt)));
}

async function insertVersions(
  tx: Tx,
  input: {
    slotId: string;
    bankId: string;
    userId: string;
    versions: TextVersion[];
  },
) {
  if (input.versions.length === 0) return;
  await tx.insert(slotVersions).values(
    input.versions.map((version, position) => ({
      id: randomUUID(),
      slotId: input.slotId,
      bankId: input.bankId,
      userId: input.userId,
      publicId: version.id,
      label: version.label,
      text: version.text,
      defaultSelected: version.defaultSelected ?? false,
      position,
    })),
  );
}

async function insertSlot(
  tx: Tx,
  input: {
    bankId: string;
    userId: string;
    publicId: string;
    position: number;
    defaultChecked: boolean;
    sectionId?: string;
    entryId?: string;
    versions: TextVersion[];
  },
) {
  const slotId = randomUUID();
  await tx.insert(slots).values({
    id: slotId,
    bankId: input.bankId,
    userId: input.userId,
    publicId: input.publicId,
    position: input.position,
    defaultChecked: input.defaultChecked,
    sectionId: input.sectionId,
    entryId: input.entryId,
  });
  await insertVersions(tx, {
    slotId,
    bankId: input.bankId,
    userId: input.userId,
    versions: input.versions,
  });
}

export async function replaceBankForUser(
  database: Database,
  userId: string,
  data: ResumeData,
  expectedUpdatedAt?: string,
): Promise<string> {
  const canonical = exportResumeData(data);
  return database.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: banks.id, updatedAt: banks.updatedAt })
      .from(banks)
      .where(ownedBy(banks.userId, banks.deletedAt, userId))
      .limit(1)
      .for("update");

    if (
      expectedUpdatedAt !== undefined &&
      (!existing || existing.updatedAt.toISOString() !== expectedUpdatedAt)
    ) {
      throw new BankConflictError();
    }

    const bankId = existing?.id ?? randomUUID();
    if (existing) {
      await hideLiveRows(tx, slotVersions, bankId);
      await hideLiveRows(tx, slots, bankId);
      await hideLiveRows(tx, sectionEntries, bankId);
      await hideLiveRows(tx, skills, bankId);
      await hideLiveRows(tx, skillCategories, bankId);
      await hideLiveRows(tx, sections, bankId);
      await hideLiveRows(tx, personalInfo, bankId);
      await tx
        .update(banks)
        .set({ updatedAt: new Date(), deletedAt: null })
        .where(eq(banks.id, bankId));
    } else {
      await tx.insert(banks).values({ id: bankId, userId });
    }

    await tx.insert(personalInfo).values({
      id: randomUUID(),
      bankId,
      userId,
      name: canonical.personalInfo.name,
      title: canonical.personalInfo.title,
      phone: canonical.personalInfo.phone,
      email: canonical.personalInfo.email,
      linkedin: canonical.personalInfo.linkedin,
      github: canonical.personalInfo.github,
    });

    for (const [position, section] of canonical.sections.entries()) {
      const sectionId = randomUUID();
      await tx.insert(sections).values({
        id: sectionId,
        bankId,
        userId,
        publicId: section.kind === "entries" ? section.id : section.kind,
        kind: section.kind,
        title: section.title,
        position,
      });

      if (section.kind === "summary") {
        await insertSlot(tx, {
          bankId,
          userId,
          sectionId,
          publicId: canonical.summary.id,
          position: 0,
          defaultChecked: false,
          versions: canonical.summary.versions,
        });
      }

      if (section.kind === "skills") {
        const categoryIds = new Map<string, string>();
        if (canonical.skillCategories.length > 0) {
          const categoryRows = canonical.skillCategories.map(
            (category, categoryPosition) => {
              const id = randomUUID();
              categoryIds.set(category.id, id);
              return {
                id,
                sectionId,
                bankId,
                userId,
                publicId: category.id,
                label: category.label,
                position: categoryPosition,
              };
            },
          );
          await tx.insert(skillCategories).values(categoryRows);
        }
        if (canonical.skills.length > 0) {
          await tx.insert(skills).values(
            canonical.skills.map((skill, skillPosition) => ({
              id: randomUUID(),
              sectionId,
              categoryId: skill.defaultCategoryId
                ? (categoryIds.get(skill.defaultCategoryId) ?? null)
                : null,
              bankId,
              userId,
              publicId: skill.id,
              name: skill.name,
              defaultChecked: skill.defaultChecked ?? false,
              position: skillPosition,
            })),
          );
        }
      }

      if (section.kind === "entries") {
        for (const [entryPosition, entry] of section.entries.entries()) {
          const entryId = randomUUID();
          await tx.insert(sectionEntries).values({
            id: entryId,
            sectionId,
            bankId,
            userId,
            publicId: entry.id,
            position: entryPosition,
            organization: entry.organization ?? null,
            title: entry.title ?? null,
            alternativeTitles: entry.alternativeTitles ?? [],
            period: entry.period ?? null,
            url: entry.url ?? null,
            defaultChecked: entry.defaultChecked ?? false,
          });
          if (entry.versions?.length) {
            await insertSlot(tx, {
              bankId,
              userId,
              entryId,
              publicId: entry.id,
              position: 0,
              defaultChecked: entry.defaultChecked ?? false,
              versions: entry.versions,
            });
          }
          for (const [bulletPosition, bullet] of (
            entry.bullets ?? []
          ).entries()) {
            await insertSlot(tx, {
              bankId,
              userId,
              entryId,
              publicId: bullet.id,
              position: bulletPosition,
              defaultChecked: bullet.defaultChecked ?? false,
              versions: bullet.versions,
            });
          }
        }
      }
    }

    const [saved] = await tx
      .select({ updatedAt: banks.updatedAt })
      .from(banks)
      .where(eq(banks.id, bankId))
      .limit(1);
    if (!saved) throw new Error("bank missing after write");
    return saved.updatedAt.toISOString();
  });
}

export async function saveBankForUser(
  database: Database,
  userId: string,
  data: ResumeData,
  expectedUpdatedAt: string,
): Promise<{ ok: true; updatedAt: string } | { ok: false; conflict: true }> {
  try {
    const updatedAt = await replaceBankForUser(
      database,
      userId,
      data,
      expectedUpdatedAt,
    );
    return { ok: true, updatedAt };
  } catch (error) {
    if (error instanceof BankConflictError) {
      return { ok: false, conflict: true };
    }
    throw error;
  }
}

export async function loadBankForUser(
  database: Database,
  userId: string,
): Promise<LoadedBank | null> {
  const [bank] = await database
    .select()
    .from(banks)
    .where(ownedBy(banks.userId, banks.deletedAt, userId))
    .limit(1);
  if (!bank) return null;

  const [info] = await database
    .select()
    .from(personalInfo)
    .where(
      and(
        eq(personalInfo.bankId, bank.id),
        eq(personalInfo.userId, userId),
        isNull(personalInfo.deletedAt),
      ),
    )
    .limit(1);
  if (!info) return null;

  const sectionRows = await database
    .select()
    .from(sections)
    .where(
      and(
        eq(sections.bankId, bank.id),
        eq(sections.userId, userId),
        isNull(sections.deletedAt),
      ),
    );
  const entryRows = await database
    .select()
    .from(sectionEntries)
    .where(
      and(
        eq(sectionEntries.bankId, bank.id),
        eq(sectionEntries.userId, userId),
        isNull(sectionEntries.deletedAt),
      ),
    );
  const slotRows = await database
    .select()
    .from(slots)
    .where(
      and(
        eq(slots.bankId, bank.id),
        eq(slots.userId, userId),
        isNull(slots.deletedAt),
      ),
    );
  const versionRows = await database
    .select()
    .from(slotVersions)
    .where(
      and(
        eq(slotVersions.bankId, bank.id),
        eq(slotVersions.userId, userId),
        isNull(slotVersions.deletedAt),
      ),
    );
  const categoryRows = await database
    .select()
    .from(skillCategories)
    .where(
      and(
        eq(skillCategories.bankId, bank.id),
        eq(skillCategories.userId, userId),
        isNull(skillCategories.deletedAt),
      ),
    );
  const skillRows = await database
    .select()
    .from(skills)
    .where(
      and(
        eq(skills.bankId, bank.id),
        eq(skills.userId, userId),
        isNull(skills.deletedAt),
      ),
    );

  const versionsBySlot = new Map<string, typeof versionRows>();
  for (const version of versionRows) {
    const list = versionsBySlot.get(version.slotId) ?? [];
    list.push(version);
    versionsBySlot.set(version.slotId, list);
  }

  const summarySection = sectionRows.find(
    (section) => section.kind === "summary",
  );
  const summarySlot = summarySection
    ? slotRows.find((slot) => slot.sectionId === summarySection.id)
    : undefined;
  const skillsSection = sectionRows.find(
    (section) => section.kind === "skills",
  );
  const categories = byPosition(
    categoryRows.filter((category) => category.sectionId === skillsSection?.id),
  );
  const categoryPublicId = new Map(
    categories.map((category) => [category.id, category.publicId]),
  );

  const data: ResumeData = {
    personalInfo: {
      name: info.name,
      title: info.title,
      phone: info.phone,
      email: info.email,
      linkedin: info.linkedin,
      github: info.github,
    },
    summary: {
      id: summarySlot?.publicId ?? "summary",
      versions: summarySlot
        ? toVersions(versionsBySlot.get(summarySlot.id) ?? [])
        : [],
    },
    skills: byPosition(
      skillRows.filter((skill) => skill.sectionId === skillsSection?.id),
    ).map((skill) => ({
      id: skill.publicId,
      name: skill.name,
      defaultChecked: skill.defaultChecked,
      defaultCategoryId: skill.categoryId
        ? (categoryPublicId.get(skill.categoryId) ?? null)
        : null,
    })),
    skillCategories: categories.map((category) => ({
      id: category.publicId,
      label: category.label,
    })),
    sections: byPosition(sectionRows).map((section) => {
      if (section.kind === "summary") {
        return { kind: "summary" as const, title: section.title };
      }
      if (section.kind === "skills") {
        return { kind: "skills" as const, title: section.title };
      }
      const entries: SectionEntry[] = byPosition(
        entryRows.filter((entry) => entry.sectionId === section.id),
      ).map((entry) => {
        const entrySlots = byPosition(
          slotRows.filter((slot) => slot.entryId === entry.id),
        );
        const body = entrySlots.find(
          (slot) => slot.publicId === entry.publicId,
        );
        const bullets = entrySlots.filter(
          (slot) => slot.publicId !== entry.publicId,
        );
        const next: SectionEntry = { id: entry.publicId };
        if (entry.organization) next.organization = entry.organization;
        if (entry.title) next.title = entry.title;
        if (entry.alternativeTitles.length > 0) {
          next.alternativeTitles = entry.alternativeTitles;
        }
        if (entry.period) next.period = entry.period;
        if (entry.url) next.url = entry.url;
        if (body) {
          next.defaultChecked = entry.defaultChecked;
          next.versions = toVersions(versionsBySlot.get(body.id) ?? []);
        }
        if (bullets.length > 0) {
          next.bullets = bullets.map((slot) => ({
            id: slot.publicId,
            defaultChecked: slot.defaultChecked,
            versions: toVersions(versionsBySlot.get(slot.id) ?? []),
          }));
        }
        return next;
      });
      return {
        kind: "entries" as const,
        id: section.publicId,
        title: section.title,
        entries,
      };
    }),
  };

  return {
    data: exportResumeData(data),
    updatedAt: bank.updatedAt.toISOString(),
  };
}
