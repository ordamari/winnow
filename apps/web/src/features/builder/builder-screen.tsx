"use client";

import { renderResume, type ResumeData } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Skeleton } from "@winnow/ui/components/skeleton";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ControlPanel } from "./panels/control-panel";
import { resumeFileName } from "./pdf/file-name";
import { ResumePdfDownload, ResumePdfPreview } from "./pdf/pdf-views";
import { useDebouncedValue } from "./pdf/use-debounced-value";
import { useBuilderStore } from "./store/builder-store";

export function BuilderScreen({
  data,
  hasApiKey,
}: {
  data: ResumeData;
  hasApiKey: boolean;
}) {
  if (useBuilderStore.getState().bank === null) {
    useBuilderStore.getState().hydrate(data);
  }

  return <BuilderWorkspace hasApiKey={hasApiKey} />;
}

function BuilderWorkspace({ hasApiKey }: { hasApiKey: boolean }) {
  const t = useTranslations("builder");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const bank = useBuilderStore((state) => state.bank);
  const selections = useBuilderStore((state) => state.selections);
  const personalInfo = useBuilderStore((state) => state.personalInfo);
  const style = useBuilderStore((state) => state.style);

  const pdfProps = useMemo(() => {
    if (!bank) return null;
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

  if (!pdfProps || !previewProps) {
    return <BuilderSkeleton />;
  }

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
