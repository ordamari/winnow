"use server";

import { parseResumeData } from "@winnow/core";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import { loadBankForUser, replaceBankForUser } from "@/server/bank/store";
import { db } from "@/server/db/client";

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

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function exportBankAction() {
  const current = await requireUser();
  const data = await loadBankForUser(db, current.user.id);
  if (!data) return null;
  return JSON.stringify(data, null, 2);
}
