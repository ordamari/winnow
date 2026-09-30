import { EmptyState } from "@winnow/ui/components/empty-state";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";

export function PlaceholderPage({ title }: { title: string }) {
  const t = useTranslations("placeholder");

  return (
    <>
      <PageHeader title={title} />
      <EmptyState title={t("title")} description={t("description")} />
    </>
  );
}
