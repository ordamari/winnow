import { setupLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { getUser, homePath } from "@/server/auth/session";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = setupLocale(locale);
  const current = await getUser();
  if (!current) {
    redirect({ href: "/sign-in", locale: activeLocale });
    throw new Error("Redirect failed");
  }
  redirect({
    href: homePath(current.profile.onboardingState),
    locale: activeLocale,
  });
}
