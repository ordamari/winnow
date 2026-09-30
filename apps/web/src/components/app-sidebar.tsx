"use client";

import { Wordmark } from "@winnow/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@winnow/ui/components/sidebar";
import { useLocale, useTranslations } from "next-intl";

import { navItems } from "@/components/nav-items";
import { Link, usePathname } from "@/i18n/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const shell = useTranslations("shell");

  return (
    <Sidebar
      collapsible="icon"
      side={locale === "he" ? "right" : "left"}
      sheetTitle={shell("sidebarTitle")}
      sheetDescription={shell("sidebarDescription")}
      closeLabel={shell("close")}
    >
      <SidebarHeader className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={t("wordmark")}
              render={<Link href="/builder" />}
            >
              <Wordmark />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={t("main")}>
          <SidebarMenu className="px-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const label = t(item.labelKey);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={label}
                    aria-current={active ? "page" : undefined}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      <SidebarRail label={shell("toggleSidebar")} />
    </Sidebar>
  );
}
