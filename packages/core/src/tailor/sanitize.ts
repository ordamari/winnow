import type { CatalogSlot, TailorCatalog } from "./catalog";
import type { BulletMatch, TailorModelOutput, TailorResult } from "./schema";

function toBoolMap(
  items: { id: string; enabled: boolean }[],
  knownIds: string[],
): Record<string, boolean> {
  const byId = new Map(items.map((item) => [item.id, item.enabled]));
  const result: Record<string, boolean> = {};
  for (const id of knownIds) {
    result[id] = byId.get(id) ?? false;
  }
  return result;
}

function toMatchMap(
  items: { id: string; matchPercent: number; reason: string }[],
  knownIds: string[],
): Record<string, BulletMatch> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const result: Record<string, BulletMatch> = {};
  for (const id of knownIds) {
    const raw = byId.get(id);
    const percent = raw?.matchPercent;
    const clamped =
      typeof percent === "number" && Number.isFinite(percent)
        ? Math.round(Math.min(100, Math.max(0, percent)))
        : 0;
    result[id] = {
      matchPercent: clamped,
      reason: (raw?.reason ?? "").trim(),
    };
  }
  return result;
}

function toVersionMap(
  items: { id: string; versionId: string }[],
  slots: CatalogSlot[],
): Record<string, string> {
  const byId = new Map(items.map((item) => [item.id, item.versionId]));
  const result: Record<string, string> = {};
  for (const slot of slots) {
    const known = new Set(slot.versions.map((version) => version.id));
    const requested = byId.get(slot.id);
    result[slot.id] =
      requested && known.has(requested) ? requested : slot.defaultVersionId;
  }
  return result;
}

function sanitizeJdMatch(raw: {
  matchPercent: number;
  reason: string;
}): BulletMatch {
  const percent = raw?.matchPercent;
  const clamped =
    typeof percent === "number" && Number.isFinite(percent)
      ? Math.round(Math.min(100, Math.max(0, percent)))
      : 0;
  return {
    matchPercent: clamped,
    reason: (raw?.reason ?? "").trim(),
  };
}

export function sanitizeTailorResult(
  raw: TailorModelOutput,
  catalog: TailorCatalog,
): TailorResult {
  const skillIds = catalog.skills.map((skill) => skill.id);
  const bulletSlots = catalog.experience.flatMap((exp) => exp.bullets);
  const bulletIds = bulletSlots.map((bullet) => bullet.id);
  const highlightIds = catalog.highlights.map((highlight) => highlight.id);
  const categoryIds = new Set(
    catalog.categories.map((category) => category.id),
  );

  const selectedVersionById = toVersionMap(raw.selectedVersions, [
    catalog.summary,
    ...bulletSlots,
    ...catalog.highlights,
  ]);

  const experienceTitles: Record<string, string> = {};
  for (const exp of catalog.experience) {
    const fromAi = raw.experienceTitles.find(
      (title) => title.id === exp.id,
    )?.title;
    experienceTitles[exp.id] = exp.allowedTitles.includes(fromAi ?? "")
      ? (fromAi as string)
      : exp.allowedTitles[0];
  }

  const skillCategoryId: Record<string, string | null> = {};
  const bySkill = new Map(
    raw.skillCategoryId.map((skill) => [skill.id, skill.categoryId]),
  );
  for (const skill of catalog.skills) {
    const assigned = bySkill.get(skill.id);
    if (assigned === undefined) {
      skillCategoryId[skill.id] = skill.categoryId;
    } else if (assigned === null || categoryIds.has(assigned)) {
      skillCategoryId[skill.id] = assigned;
    } else {
      skillCategoryId[skill.id] = skill.categoryId;
    }
  }

  const selectedTitle = raw.selectedTitle.trim() || catalog.currentTitle;

  const enabledBullets = toBoolMap(raw.enabledBullets, bulletIds);

  // Soft floor: never leave a role empty (model sometimes over-prunes).
  const MIN_BULLETS_PER_JOB = 2;
  for (const exp of catalog.experience) {
    const ids = exp.bullets.map((bullet) => bullet.id);
    if (ids.length === 0) continue;
    let enabledCount = ids.filter((id) => enabledBullets[id]).length;
    const floor = Math.min(MIN_BULLETS_PER_JOB, ids.length);
    if (enabledCount >= floor) continue;
    for (const id of ids) {
      if (enabledCount >= floor) break;
      if (!enabledBullets[id]) {
        enabledBullets[id] = true;
        enabledCount += 1;
      }
    }
  }

  const enabledSkills = toBoolMap(raw.enabledSkills, skillIds);

  // Soft floor: keep toolkit families intact when the model over-prunes skills.
  const MIN_PER_POPULATED_CATEGORY = 2;
  for (const category of catalog.categories) {
    const inCategory = catalog.skills.filter(
      (skill) => skillCategoryId[skill.id] === category.id,
    );
    if (inCategory.length === 0) continue;
    let enabledInCategory = inCategory.filter(
      (skill) => enabledSkills[skill.id],
    ).length;
    if (enabledInCategory === 0) continue;
    const floor = Math.min(MIN_PER_POPULATED_CATEGORY, inCategory.length);
    if (enabledInCategory >= floor) continue;
    for (const skill of inCategory) {
      if (enabledInCategory >= floor) break;
      if (!enabledSkills[skill.id]) {
        enabledSkills[skill.id] = true;
        enabledInCategory += 1;
      }
    }
  }

  const MIN_SKILLS = 12;
  let enabledSkillCount = skillIds.filter((id) => enabledSkills[id]).length;
  const skillFloor = Math.min(MIN_SKILLS, skillIds.length);
  if (enabledSkillCount < skillFloor) {
    const populatedCategories = new Set(
      catalog.skills
        .filter((skill) => enabledSkills[skill.id])
        .map((skill) => skillCategoryId[skill.id])
        .filter((id): id is string => id != null),
    );
    const refillOrder = [
      ...catalog.skills.filter(
        (skill) =>
          !enabledSkills[skill.id] &&
          skill.categoryId != null &&
          populatedCategories.has(
            skillCategoryId[skill.id] ?? skill.categoryId,
          ),
      ),
      ...catalog.skills.filter((skill) => !enabledSkills[skill.id]),
    ];
    const seen = new Set<string>();
    for (const skill of refillOrder) {
      if (enabledSkillCount >= skillFloor) break;
      if (seen.has(skill.id) || enabledSkills[skill.id]) continue;
      seen.add(skill.id);
      enabledSkills[skill.id] = true;
      enabledSkillCount += 1;
    }
  }

  return {
    selectedTitle,
    selectedVersionById,
    experienceTitles,
    enabledSkills,
    enabledBullets,
    enabledHighlights: toBoolMap(raw.enabledHighlights, highlightIds),
    skillCategoryId,
    bulletMatches: toMatchMap(raw.bulletMatches, bulletIds),
    highlightMatches: toMatchMap(raw.highlightMatches, highlightIds),
    jdMatch: sanitizeJdMatch(raw.jdMatch),
  };
}
