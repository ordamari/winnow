"use client";

import { Button } from "@winnow/ui/components/button";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { createEmptyBankAction } from "@/server/bank/actions";

import { BankMenu } from "./bank-menu";

export function EmptyBank() {
  const t = useTranslations("bank");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    const result = await createEmptyBankAction();
    setPending(false);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("emptyDescription")}
        actions={<BankMenu hasBank={false} />}
      />
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Button type="button" disabled={pending} onClick={start}>
            {pending ? t("starting") : t("startBlank")}
          </Button>
        }
      />
    </div>
  );
}
