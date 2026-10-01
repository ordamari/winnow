"use client";

import { useState } from "react";

import { type BankSnapshot, useHydrateBank } from "./bank-query";
import { BankScreen } from "./bank-screen";
import { EmptyBank } from "./empty-bank";
import { ResumeImport } from "./resume-import";

export function BankRoute({ initial }: { initial: BankSnapshot | null }) {
  const bank = useHydrateBank(initial);
  const [importing, setImporting] = useState(false);

  if (importing) {
    return (
      <ResumeImport
        existing={bank?.data ?? null}
        expectedUpdatedAt={bank?.updatedAt ?? null}
        onCancel={() => setImporting(false)}
      />
    );
  }

  if (!bank) return <EmptyBank onImport={() => setImporting(true)} />;
  return <BankScreen onImport={() => setImporting(true)} />;
}
