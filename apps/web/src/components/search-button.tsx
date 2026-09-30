import { useTranslations } from "next-intl"
import { SearchIcon } from "lucide-react"
import { Button } from "@winnow/ui/components/button"

export function SearchButton() {
  const t = useTranslations("shell")

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled
      aria-label={t("searchComingSoon")}
      className="text-muted-foreground"
    >
      <SearchIcon />
      <span className="hidden sm:inline">{t("search")}</span>
      <kbd className="ms-1 hidden rounded border bg-muted px-1 font-mono text-[10px] font-medium sm:inline">
        ⌘K
      </kbd>
    </Button>
  )
}
