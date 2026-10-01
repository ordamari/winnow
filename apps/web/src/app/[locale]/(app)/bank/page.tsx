import { BankScreen } from "@/features/bank/bank-screen";
import { EmptyBank } from "@/features/bank/empty-bank";
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
  const bank = await loadBankForUser(db, current.user.id);

  if (!bank) return <EmptyBank />;
  return <BankScreen key={bank.updatedAt} initial={bank} />;
}
