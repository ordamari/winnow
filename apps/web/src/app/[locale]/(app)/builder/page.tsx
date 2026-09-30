import type { ResumeData } from "@winnow/core";
import { ErrorState } from "@winnow/ui/components/error-state";
import { getTranslations } from "next-intl/server";

import { BuilderScreen } from "@/features/builder/builder-screen";
import { loadResumeData } from "@/features/builder/load-resume";
import { setupLocale } from "@/i18n/locale";

export const dynamic = "force-dynamic";

async function loadBuilder(): Promise<{
  data: ResumeData;
  hasApiKey: boolean;
} | null> {
  try {
    const data = await loadResumeData();
    return {
      data,
      hasApiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    };
  } catch {
    return null;
  }
}

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const t = await getTranslations("builder");
  const loaded = await loadBuilder();

  if (!loaded) {
    return (
      <ErrorState title={t("loadErrorTitle")} description={t("loadError")} />
    );
  }

  return <BuilderScreen data={loaded.data} hasApiKey={loaded.hasApiKey} />;
}
