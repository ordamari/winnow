import { PageHeader } from "@winnow/ui/components/page-header";
import { getTranslations } from "next-intl/server";

import { BankImport } from "@/features/bank/bank-import";
import { setupLocale } from "@/i18n/locale";
import { requireUser } from "@/server/auth/session";
import { loadBankForUser } from "@/server/bank/store";
import { db } from "@/server/db/client";

export const dynamic = "force-dynamic";

export default async function BankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const current = await requireUser();
  const t = await getTranslations("bank");
  const bank = await loadBankForUser(db, current.user.id);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <BankImport hasBank={bank !== null} />
    </>
  );
}
