import type { ResumeData } from "@winnow/core";

import { useBuilderStore } from "./builder-store";

let sessionUserId: string | null = null;
let sessionBank: ResumeData | null = null;

export function syncBuilderSession(userId: string, bank: ResumeData) {
  const store = useBuilderStore.getState();
  if (sessionUserId !== userId || !sessionBank) {
    sessionUserId = userId;
    sessionBank = bank;
    store.seedSession(userId, bank);
    return;
  }
  if (sessionBank === bank) return;
  const previous = sessionBank;
  sessionBank = bank;
  store.applyBankChange(previous, bank);
}
