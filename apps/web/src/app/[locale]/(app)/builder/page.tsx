import { getTranslations } from "next-intl/server";
import { ErrorState } from "@winnow/ui/components/error-state";

import { BuilderScreen } from "@/features/builder/builder-screen";
import { loadResumeData } from "@/features/builder/load-resume";
import { setupLocale } from "@/i18n/locale";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const t = await getTranslations("builder");

  try {
    const data = await loadResumeData();
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    return <BuilderScreen data={data} hasApiKey={hasApiKey} />;
  } catch {
    return (
      <ErrorState title={t("loadErrorTitle")} description={t("loadError")} />
    );
  }
}
