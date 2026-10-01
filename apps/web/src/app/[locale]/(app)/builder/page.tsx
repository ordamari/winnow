import { BuilderScreen } from "@/features/builder/builder-screen";
import { loadResumeData } from "@/features/builder/load-resume";
import { setupLocale } from "@/i18n/locale";
import { requireUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const current = await requireUser();

  let initial: Awaited<ReturnType<typeof loadResumeData>> = null;
  let loadError = false;
  try {
    initial = await loadResumeData(current.user.id);
  } catch {
    loadError = true;
  }

  return (
    <BuilderScreen
      initial={initial}
      loadError={loadError}
      hasApiKey={Boolean(process.env.OPENAI_API_KEY?.trim())}
    />
  );
}
