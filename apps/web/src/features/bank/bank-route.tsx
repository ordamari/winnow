"use client";

import { type BankSnapshot, useHydrateBank } from "./bank-query";
import { BankScreen } from "./bank-screen";
import { EmptyBank } from "./empty-bank";

export function BankRoute({ initial }: { initial: BankSnapshot | null }) {
  const bank = useHydrateBank(initial);
  if (!bank) return <EmptyBank />;
  return <BankScreen />;
}
