import { useTranslations } from "next-intl"
import { EmptyState } from "@winnow/ui/components/empty-state"
import { PageHeader } from "@winnow/ui/components/page-header"

export function PlaceholderPage({ title }: { title: string }) {
  const t = useTranslations("placeholder")

  return (
    <>
      <PageHeader title={title} />
      <EmptyState title={t("title")} description={t("description")} />
    </>
  )
}
