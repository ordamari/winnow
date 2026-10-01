"use client";

import { renderResume, type ResumeData } from "@winnow/core";
import { Button, buttonVariants } from "@winnow/ui/components/button";
import { EmptyState } from "@winnow/ui/components/empty-state";
import { ErrorState } from "@winnow/ui/components/error-state";
import { Skeleton } from "@winnow/ui/components/skeleton";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

import { useBankUserId } from "@/components/query-provider";
import { type BankSnapshot, useHydrateBank } from "@/features/bank/bank-query";
import { Link } from "@/i18n/navigation";

import { ControlPanel } from "./panels/control-panel";
import { resumeFileName } from "./pdf/file-name";
import { ResumePdfDownload, ResumePdfPreview } from "./pdf/pdf-views";
import { useDebouncedValue } from "./pdf/use-debounced-value";
import { useBuilderStore } from "./store/builder-store";
import { syncBuilderSession } from "./store/session-sync";

export function BuilderScreen({
  initial,
  loadError,
  hasApiKey,
}: {
  initial: BankSnapshot | null;
  loadError: boolean;
  hasApiKey: boolean;
}) {
  const t = useTranslations("builder");
  const userId = useBankUserId();
  const loaded = useHydrateBank(initial);
  const sessionUserId = useBuilderStore((state) => state.sessionUserId);

  useLayoutEffect(() => {
    if (!loaded) return;
    syncBuilderSession(userId, loaded.data);
  }, [loaded, userId]);

  if (!loaded) {
    if (loadError) {
      return (
        <ErrorState title={t("loadErrorTitle")} description={t("loadError")} />
      );
    }
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={
          <Link href="/bank" className={buttonVariants()}>
            {t("emptyAction")}
          </Link>
        }
      />
    );
  }

  if (sessionUserId !== userId) return <BuilderSkeleton />;

  return <BuilderWorkspace bank={loaded.data} hasApiKey={hasApiKey} />;
}

function BuilderWorkspace({
  bank,
  hasApiKey,
}: {
  bank: ResumeData;
  hasApiKey: boolean;
}) {
  const t = useTranslations("builder");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const selections = useBuilderStore((state) => state.selections);
  const personalInfo = useBuilderStore((state) => state.personalInfo);
  const style = useBuilderStore((state) => state.style);

  const pdfProps = useMemo(() => {
    const rendered = renderResume(bank, selections);
    return {
      personalInfo,
      title: selections.selectedTitle,
      summary: rendered.selectedSummary,
      skillCategories: rendered.skillCategories,
      sections: rendered.sections,
      styleOverrides: style,
    };
  }, [bank, personalInfo, selections, style]);

  const previewProps = useDebouncedValue(pdfProps, 250);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2">
        <h1 className="text-sm font-semibold tracking-tight">{t("title")}</h1>
        <ResumePdfDownload
          documentProps={pdfProps}
          fileName={resumeFileName(personalInfo.name)}
          label={t("export")}
          preparingLabel={t("preparing")}
        />
      </header>

      <div className="flex shrink-0 gap-2 border-b px-4 py-2 lg:hidden">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          variant={pane === "edit" ? "default" : "outline"}
          onClick={() => setPane("edit")}
        >
          {t("edit")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          variant={pane === "preview" ? "default" : "outline"}
          onClick={() => setPane("preview")}
        >
          {t("preview")}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "min-h-0 w-full flex-col border-e lg:flex lg:w-96 lg:shrink-0",
            pane === "preview" ? "hidden lg:flex" : "flex",
          )}
        >
          <ControlPanel hasApiKey={hasApiKey} />
        </aside>
        <main
          dir="ltr"
          className={cn(
            "min-h-0 min-w-0 flex-1 bg-muted/40 p-4",
            pane === "edit" ? "hidden lg:block" : "block",
          )}
        >
          <ResumePdfPreview documentProps={previewProps} />
        </main>
      </div>
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="min-h-64 flex-1" />
    </div>
  );
}
