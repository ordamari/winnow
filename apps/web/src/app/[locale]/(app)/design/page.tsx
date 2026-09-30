import { notFound } from "next/navigation";

import { DesignGallery } from "@/components/design-gallery";
import { setupLocale } from "@/i18n/locale";

export default async function DesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setupLocale(locale);

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DesignGallery />;
}
