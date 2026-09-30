import { SidebarTrigger } from "@winnow/ui/components/sidebar";
import { useTranslations } from "next-intl";

import { SearchButton } from "@/components/search-button";
import { UserMenu } from "@/components/user-menu";

export function TopBar({ userName }: { userName: string }) {
  const t = useTranslations("shell");

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-background px-3">
      <SidebarTrigger label={t("toggleSidebar")} />
      <SearchButton />
      <div className="ms-auto">
        <UserMenu userName={userName} />
      </div>
    </header>
  );
}
