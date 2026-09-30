import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/components/placeholder-page";
import { setupLocale } from "@/i18n/locale";

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const t = await getTranslations("nav");
  return <PlaceholderPage title={t("insights")} />;
}
