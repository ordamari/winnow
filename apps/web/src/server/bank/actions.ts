"use server";

import { emptyResumeData, parseResumeData } from "@winnow/core";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import {
  loadBankForUser,
  replaceBankForUser,
  saveBankForUser,
} from "@/server/bank/store";
import { db } from "@/server/db/client";

export async function loadBankAction() {
  const current = await requireUser();
  return loadBankForUser(db, current.user.id);
}

export async function importBankAction(raw: string) {
  const current = await requireUser();
  let parsed: ReturnType<typeof parseResumeData>;
  try {
    parsed = parseResumeData(JSON.parse(raw) as unknown);
  } catch {
    return { ok: false as const };
  }

  try {
    await replaceBankForUser(db, current.user.id, parsed);
  } catch {
    return { ok: false as const };
  }

  const loaded = await loadBankForUser(db, current.user.id);
  if (!loaded) return { ok: false as const };

  revalidatePath("/", "layout");
  return { ok: true as const, data: loaded.data, updatedAt: loaded.updatedAt };
}

export async function exportBankAction() {
  const current = await requireUser();
  const loaded = await loadBankForUser(db, current.user.id);
  if (!loaded) return null;
  return JSON.stringify(loaded.data, null, 2);
}

export async function saveBankAction(raw: unknown, expectedUpdatedAt: string) {
  const current = await requireUser();
  let parsed: ReturnType<typeof parseResumeData>;
  try {
    parsed = parseResumeData(raw);
  } catch {
    return { ok: false as const, conflict: false as const };
  }

  const result = await saveBankForUser(
    db,
    current.user.id,
    parsed,
    expectedUpdatedAt,
  );
  if (!result.ok) return { ok: false as const, conflict: true as const };
  return { ok: true as const, updatedAt: result.updatedAt };
}

export async function createEmptyBankAction() {
  const current = await requireUser();
  const existing = await loadBankForUser(db, current.user.id);
  if (existing) return { ok: false as const };
  await replaceBankForUser(db, current.user.id, emptyResumeData());
  const loaded = await loadBankForUser(db, current.user.id);
  if (!loaded) return { ok: false as const };
  revalidatePath("/", "layout");
  return { ok: true as const, data: loaded.data, updatedAt: loaded.updatedAt };
}
