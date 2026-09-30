"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@winnow/ui/components/avatar"
import { Button } from "@winnow/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@winnow/ui/components/dropdown-menu"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export function UserMenu() {
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("account")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label={t("menu")} />}
      >
        <Avatar size="sm">
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{t("you")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("you")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={setTheme}
          >
            <DropdownMenuRadioItem value="light">
              {t("light")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              {t("dark")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              {t("system")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => {
              const next = routing.locales.find((item) => item === value)
              if (next) {
                router.replace(pathname, { locale: next })
              }
            }}
          >
            {routing.locales.map((item) => (
              <DropdownMenuRadioItem key={item} value={item}>
                {item === "en" ? t("locales.en") : t("locales.he")}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>{t("signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
