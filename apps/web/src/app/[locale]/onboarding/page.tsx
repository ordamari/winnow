import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@winnow/ui/components/card";
import { getTranslations } from "next-intl/server";

import { OnboardingSignOut } from "@/features/account/onboarding-sign-out";
import { ProfileForm } from "@/features/account/profile-form";
import { setupLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { homePath, requireUser } from "@/server/auth/session";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = setupLocale(locale);
  const current = await requireUser({ allowPending: true });
  if (current.profile.onboardingState === "complete") {
    redirect({ href: homePath("complete"), locale: activeLocale });
  }

  const t = await getTranslations("onboarding");

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <h1>{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ProfileForm
            mode="onboarding"
            initial={{
              name: current.user.name,
              title: current.profile.title,
              phone: current.profile.phone,
              linkedin: current.profile.linkedin,
              github: current.profile.github,
              timezone: current.profile.timezone,
              locale: current.profile.locale === "he" ? "he" : "en",
            }}
          />
          <OnboardingSignOut label={t("signOut")} />
        </CardContent>
      </Card>
    </main>
  );
}
