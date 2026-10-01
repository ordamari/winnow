"use client";

import { Button } from "@winnow/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@winnow/ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@winnow/ui/components/sheet";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { exportBankAction } from "@/server/bank/actions";

import { BankImport } from "./bank-import";

export function BankMenu({ hasBank }: { hasBank: boolean }) {
  const t = useTranslations("bank");
  const [open, setOpen] = useState(false);

  async function onExport() {
    const json = await exportBankAction();
    if (!json) return;
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          {t("menu")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            {t("importJson")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!hasBank} onClick={onExport}>
            {t("export")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("importJson")}</SheetTitle>
            <SheetDescription>{t("importHint")}</SheetDescription>
          </SheetHeader>
          <BankImport onImported={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
