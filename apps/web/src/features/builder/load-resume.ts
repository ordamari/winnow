import "server-only";

import { loadBankForUser } from "@/server/bank/store";
import { db } from "@/server/db/client";

export async function loadResumeData(userId: string) {
  return loadBankForUser(db, userId);
}
