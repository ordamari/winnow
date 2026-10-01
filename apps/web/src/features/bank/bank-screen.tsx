"use client";

import type { ResumeData } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { PageHeader } from "@winnow/ui/components/page-header";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { BankMenu } from "./bank-menu";
import { useBankData } from "./bank-query";
import type { EditorSelection } from "./document";
import { EntryEditor } from "./entry-editor";
import { PersonalEditor } from "./personal-editor";
import { SectionRail } from "./section-rail";
import { SkillsBoard } from "./skills-board";
import { SummaryEditor } from "./summary-editor";
import { useBankSave } from "./use-bank-save";

function activeSelection(
  data: ResumeData,
  selection: EditorSelection,
): EditorSelection {
  if (selection.type !== "entry") return selection;
  const section = data.sections.find(
    (item) => item.kind === "entries" && item.id === selection.sectionId,
  );
  if (!section || section.kind !== "entries") return { type: "personal" };
  if (!section.entries.some((entry) => entry.id === selection.entryId)) {
    return { type: "personal" };
  }
  return selection;
}

export function BankScreen() {
  const t = useTranslations("bank");
  const bank = useBankData();
  const [selection, setSelection] = useState<EditorSelection>({
    type: "personal",
  });
  const { status, schedule, reload } = useBankSave();
  const data = bank?.data;
  const current = data ? activeSelection(data, selection) : selection;

  if (!data) return null;
  const document = data;

  function onEdit(next: ResumeData, undo?: "deleted" | "reordered") {
    const previous = document;
    schedule(next);
    if (!undo) return;
    toast(t(undo), {
      action: {
        label: t("undo"),
        onClick: () => {
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
          <Button type="button" size="sm" onClick={reload}>
            {t("reload")}
          </Button>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto rounded-xl border bg-card p-3">
          <SectionRail
            data={document}
            selection={current}
            onSelect={setSelection}
            onEdit={onEdit}
          />
        </aside>
        <div className="min-h-0 overflow-auto rounded-xl border bg-card p-4">
          {current.type === "personal" ? (
            <PersonalEditor data={document} onEdit={onEdit} />
          ) : null}
          {current.type === "summary" ? (
            <SummaryEditor data={document} onEdit={onEdit} />
          ) : null}
          {current.type === "skills" ? (
            <SkillsBoard data={document} onEdit={onEdit} />
          ) : null}
          {current.type === "entry" ? (
            <EntryEditor
              data={document}
              sectionId={current.sectionId}
              entryId={current.entryId}
              onEdit={onEdit}
              onSelectEntry={(entryId) => {
                if (!entryId) {
                  setSelection({ type: "personal" });
                  return;
                }
                setSelection({
                  type: "entry",
                  sectionId: current.sectionId,
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
