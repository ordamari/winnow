import { setupLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = setupLocale(locale);
  redirect({ href: "/builder", locale: activeLocale });
}
