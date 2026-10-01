import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import { setupLocale } from "@/i18n/locale";
import { requireUser } from "@/server/auth/session";

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const current = await requireUser();

  return (
    <QueryProvider userId={current.user.id}>
      <AppShell userName={current.user.name}>{children}</AppShell>
    </QueryProvider>
  );
}
