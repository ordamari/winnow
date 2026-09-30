import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@winnow/ui/components/card";
import { getTranslations } from "next-intl/server";

import { env } from "@/env";
import { SignInForm } from "@/features/account/sign-in-form";
import { setupLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { safeAppPath } from "@/lib/app-paths";
import { getUser, homePath } from "@/server/auth/session";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const activeLocale = setupLocale(locale);
  const current = await getUser();
  if (current) {
    redirect({
      href: homePath(current.profile.onboardingState),
      locale: activeLocale,
    });
  }

  const nextPath = safeAppPath((await searchParams).next, activeLocale);
  const t = await getTranslations("auth");
  const wordmark = await getTranslations("nav");

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {wordmark("wordmark")}
          </p>
          <CardTitle>
            <h1>{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm
            locale={activeLocale}
            nextPath={nextPath}
            google={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)}
            github={Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
