import { buttonVariants } from "@winnow/ui/components/button";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { ErrorState } from "@winnow/ui/components/error-state";
import { getTranslations } from "next-intl/server";

import { BuilderScreen } from "@/features/builder/builder-screen";
import { loadResumeData } from "@/features/builder/load-resume";
import { setupLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const t = await getTranslations("builder");
  const current = await requireUser();

  let data: Awaited<ReturnType<typeof loadResumeData>> = null;
  try {
    data = await loadResumeData(current.user.id);
  } catch {
    return (
      <ErrorState title={t("loadErrorTitle")} description={t("loadError")} />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Link href="/bank" className={buttonVariants()}>
            {t("emptyAction")}
          </Link>
        }
      />
    );
  }

  return (
    <BuilderScreen
      data={data}
      hasApiKey={Boolean(process.env.OPENAI_API_KEY?.trim())}
    />
  );
}
