"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@winnow/ui/components/button";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useBankUserId } from "@/components/query-provider";
import { useRouter } from "@/i18n/navigation";
import { createEmptyBankAction } from "@/server/bank/actions";

import { BankMenu } from "./bank-menu";
import { bankQueryKey } from "./bank-query";

export function EmptyBank({ onImport }: { onImport: () => void }) {
  const t = useTranslations("bank");
  const router = useRouter();
  const userId = useBankUserId();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    const result = await createEmptyBankAction();
    setPending(false);
    if (!result.ok) return;
    queryClient.setQueryData(bankQueryKey(userId), {
      data: result.data,
      updatedAt: result.updatedAt,
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("emptyDescription")}
        actions={<BankMenu hasBank={false} onImportResume={onImport} />}
      />
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onImport}>
              {t("importResume")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={start}
            >
              {pending ? t("starting") : t("startBlank")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
