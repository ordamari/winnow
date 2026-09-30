import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { env } from "@/env";
import { SettingsScreen } from "@/features/account/settings-screen";
import { setupLocale } from "@/i18n/locale";
import { auth } from "@/server/auth/auth";
import { requireUser } from "@/server/auth/session";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);
  const current = await requireUser();
  const t = await getTranslations("nav");
  const listed = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const accounts = listed
    .filter((account) => account.providerId !== "credential")
    .map((account) => ({
      id: account.id,
      providerId: account.providerId,
    }));

  return (
    <SettingsScreen
      title={t("settings")}
      email={current.user.email}
      profile={{
        name: current.user.name,
        title: current.profile.title,
        phone: current.profile.phone,
        linkedin: current.profile.linkedin,
        github: current.profile.github,
        timezone: current.profile.timezone,
        locale: current.profile.locale === "he" ? "he" : "en",
      }}
      accounts={accounts}
      google={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)}
      github={Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)}
    />
  );
}
