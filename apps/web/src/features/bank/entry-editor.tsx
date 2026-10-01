"use client";

import {
  type ResumeData,
  safeMarkdownUrl,
  type SectionEntry,
} from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  addBullet,
  addVersion,
  removeBullet,
  removeEntry,
  removeVersion,
  renameSection,
  renameVersion,
  reorderBullets,
  reorderVersions,
  setDefaultVersion,
  updateEntry,
  updateVersionText,
} from "./document";
import { PeriodField } from "./period-field";
import { BulletList, VersionList } from "./version-list";

function entryOf(data: ResumeData, sectionId: string, entryId: string) {
  const section = data.sections.find(
    (item) => item.kind === "entries" && item.id === sectionId,
  );
  if (section?.kind !== "entries") return null;
  const entry = section.entries.find((item) => item.id === entryId);
  if (!entry) return null;
  return { section, entry };
}

function TitleChips({
  titles,
  onChange,
}: {
  titles: string[];
  onChange: (titles: string[]) => void;
}) {
  const t = useTranslations("bank");
  const [draft, setDraft] = useState("");

  function add() {
    const next = draft.trim();
    if (!next) return;
    onChange([...titles, next]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="alt-title">{t("alternativeTitles")}</Label>
      <div className="flex flex-wrap gap-1">
        {titles.map((title) => (
          <button
            key={title}
            type="button"
            className="rounded-full border bg-muted px-2 py-0.5 text-xs"
            onClick={() => onChange(titles.filter((item) => item !== title))}
          >
            {title}
            <span className="sr-only">{t("delete")}</span>
          </button>
        ))}
      </div>
      <Input
        id="alt-title"
        value={draft}
        placeholder={t("alternativePlaceholder")}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add();
          }
        }}
      />
    </div>
  );
}

export function EntryEditor({
  data,
  sectionId,
  entryId,
  onEdit,
  onSelectEntry,
}: {
  data: ResumeData;
  sectionId: string;
  entryId: string;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
  onSelectEntry: (entryId: string | null) => void;
}) {
  const t = useTranslations("bank");
  const [focusVersionId, setFocusVersionId] = useState<string>();
  const found = entryOf(data, sectionId, entryId);
  if (!found) return null;
  const { section, entry } = found;
  const versioned = (entry.versions?.length ?? 0) > 0 && !entry.bullets?.length;

  function patch(partial: Partial<SectionEntry>) {
    onEdit(updateEntry(data, sectionId, entryId, partial));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="entry-section-title">{t("sectionTitle")}</Label>
          <Input
            id="entry-section-title"
            value={section.title}
            onChange={(event) =>
              onEdit(renameSection(data, sectionId, event.target.value))
            }
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onSelectEntry(null);
            onEdit(removeEntry(data, sectionId, entryId), "deleted");
          }}
        >
          {t("deleteEntry")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="entry-org">{t("organization")}</Label>
          <Input
            id="entry-org"
            value={entry.organization ?? ""}
            onChange={(event) => patch({ organization: event.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="entry-title">{t("role")}</Label>
          <Input
            id="entry-title"
            value={entry.title ?? ""}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </div>
      </div>

      <TitleChips
        titles={entry.alternativeTitles ?? []}
        onChange={(alternativeTitles) => patch({ alternativeTitles })}
      />
      <PeriodField
        value={entry.period}
        onChange={(period) => patch({ period })}
      />
      <div className="space-y-1">
        <Label htmlFor="entry-url">{t("url")}</Label>
        <Input
          id="entry-url"
          value={entry.url ?? ""}
          placeholder={t("urlPlaceholder")}
          onChange={(event) => patch({ url: event.target.value })}
          onBlur={(event) => {
            const trimmed = event.target.value.trim();
            if (!trimmed) {
              patch({ url: undefined });
              return;
            }
            if (safeMarkdownUrl(trimmed)) {
              patch({ url: trimmed });
              return;
            }
            const withScheme = `https://${trimmed}`;
            patch({
              url: safeMarkdownUrl(withScheme) ? withScheme : trimmed,
            });
          }}
        />
      </div>

      {versioned ? (
        <VersionList
          dndId={`entry-versions-${entry.id}`}
          slot={{
            id: entry.id,
            defaultChecked: entry.defaultChecked,
            versions: entry.versions ?? [],
          }}
          bullet={false}
          focusVersionId={focusVersionId}
          onText={(versionId, text) =>
            onEdit(
              updateVersionText(
                data,
                { kind: "highlight", sectionId, entryId },
                versionId,
                text,
              ),
            )
          }
          onLabel={(versionId, label) =>
            onEdit(
              renameVersion(
                data,
                { kind: "highlight", sectionId, entryId },
                versionId,
                label,
              ),
            )
          }
          onDefault={(versionId) =>
            onEdit(
              setDefaultVersion(
                data,
                { kind: "highlight", sectionId, entryId },
                versionId,
              ),
            )
          }
          onReorder={(activeId, overId) =>
            onEdit(
              reorderVersions(
                data,
                { kind: "highlight", sectionId, entryId },
                activeId,
                overId,
              ),
              "reordered",
            )
          }
          onAdd={(afterVersionId) => {
            const added = addVersion(
              data,
              { kind: "highlight", sectionId, entryId },
              afterVersionId,
            );
            setFocusVersionId(added.versionId);
            onEdit(added.data);
          }}
          onRemove={(versionId) =>
            onEdit(
              removeVersion(
                data,
                { kind: "highlight", sectionId, entryId },
                versionId,
              ),
              "deleted",
            )
          }
        />
      ) : (
        <BulletList
          dndId={`entry-bullets-${entry.id}`}
          bullets={entry.bullets ?? []}
          focusVersionId={focusVersionId}
          onText={(bulletId, versionId, text) =>
            onEdit(
              updateVersionText(
                data,
                { kind: "bullet", sectionId, entryId, bulletId },
                versionId,
                text,
              ),
            )
          }
          onLabel={(bulletId, versionId, label) =>
            onEdit(
              renameVersion(
                data,
                { kind: "bullet", sectionId, entryId, bulletId },
                versionId,
                label,
              ),
            )
          }
          onDefault={(bulletId, versionId) =>
            onEdit(
              setDefaultVersion(
                data,
                { kind: "bullet", sectionId, entryId, bulletId },
                versionId,
              ),
            )
          }
          onReorderVersions={(bulletId, activeId, overId) =>
            onEdit(
              reorderVersions(
                data,
                { kind: "bullet", sectionId, entryId, bulletId },
                activeId,
                overId,
              ),
              "reordered",
            )
          }
          onAddVersion={(bulletId, afterVersionId) => {
            const added = addVersion(
              data,
              { kind: "bullet", sectionId, entryId, bulletId },
              afterVersionId,
            );
            setFocusVersionId(added.versionId);
            onEdit(added.data);
          }}
          onRemoveVersion={(bulletId, versionId) =>
            onEdit(
              removeVersion(
                data,
                { kind: "bullet", sectionId, entryId, bulletId },
                versionId,
              ),
              "deleted",
            )
          }
          onReorderBullets={(activeId, overId) =>
            onEdit(
              reorderBullets(data, sectionId, entryId, activeId, overId),
              "reordered",
            )
          }
          onAddBullet={(afterBulletId) => {
            const added = addBullet(data, sectionId, entryId, afterBulletId);
            if (!added) return;
            setFocusVersionId(added.versionId);
            onEdit(added.data);
          }}
          onRemoveBullet={(bulletId) =>
            onEdit(removeBullet(data, sectionId, entryId, bulletId), "deleted")
          }
        />
      )}

      {versioned ? null : (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const added = addBullet(data, sectionId, entryId);
            if (!added) return;
            setFocusVersionId(added.versionId);
            onEdit(added.data);
          }}
        >
          {t("addBullet")}
        </Button>
      )}
    </div>
  );
}
