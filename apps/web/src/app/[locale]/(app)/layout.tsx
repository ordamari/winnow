import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { setupLocale } from "@/i18n/locale";

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);

  return <AppShell>{children}</AppShell>;
}
