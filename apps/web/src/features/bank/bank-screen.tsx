"use client";

import type { ResumeData } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";

import { BankMenu } from "./bank-menu";
import type { EditorSelection } from "./document";
import { EntryEditor } from "./entry-editor";
import { PersonalEditor } from "./personal-editor";
import { SectionRail } from "./section-rail";
import { SkillsBoard } from "./skills-board";
import { SummaryEditor } from "./summary-editor";
import { useBankSave } from "./use-bank-save";

export function BankScreen({
  initial,
}: {
  initial: { data: ResumeData; updatedAt: string };
}) {
  const t = useTranslations("bank");
  const router = useRouter();
  const [data, setData] = useState(initial.data);
  const [selection, setSelection] = useState<EditorSelection>({
    type: "personal",
  });
  const { status, schedule } = useBankSave(initial.updatedAt);

  function onEdit(next: ResumeData, undo?: "deleted" | "reordered") {
    const previous = data;
    setData(next);
    schedule(next);
    if (!undo) return;
    toast(t(undo), {
      action: {
        label: t("undo"),
        onClick: () => {
          setData(previous);
          schedule(previous);
        },
      },
    });
  }

  const statusLabel =
    status === "saving"
      ? t("saving")
      : status === "saved"
        ? t("saved")
        : status === "conflict"
          ? t("conflict")
          : t("saveError");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {statusLabel}
            </span>
            <BankMenu hasBank />
          </>
        }
      />
      {status === "conflict" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
          <p className="text-sm">{t("conflict")}</p>
          <Button type="button" size="sm" onClick={() => router.refresh()}>
            {t("reload")}
          </Button>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto rounded-xl border bg-card p-3">
          <SectionRail
            data={data}
            selection={selection}
            onSelect={setSelection}
            onEdit={onEdit}
          />
        </aside>
        <div className="min-h-0 overflow-auto rounded-xl border bg-card p-4">
          {selection.type === "personal" ? (
            <PersonalEditor data={data} onEdit={onEdit} />
          ) : null}
          {selection.type === "summary" ? (
            <SummaryEditor data={data} onEdit={onEdit} />
          ) : null}
          {selection.type === "skills" ? (
            <SkillsBoard data={data} onEdit={onEdit} />
          ) : null}
          {selection.type === "entry" ? (
            <EntryEditor
              data={data}
              sectionId={selection.sectionId}
              entryId={selection.entryId}
              onEdit={onEdit}
              onSelectEntry={(entryId) => {
                if (!entryId) {
                  setSelection({ type: "personal" });
                  return;
                }
                setSelection({
                  type: "entry",
                  sectionId: selection.sectionId,
                  entryId,
                });
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
