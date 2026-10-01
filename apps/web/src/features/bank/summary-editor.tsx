"use client";

import type { ResumeData } from "@winnow/core";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  addVersion,
  removeVersion,
  renameSection,
  renameVersion,
  reorderVersions,
  setDefaultVersion,
  updateVersionText,
} from "./document";
import { VersionList } from "./version-list";

export function SummaryEditor({
  data,
  onEdit,
}: {
  data: ResumeData;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
}) {
  const t = useTranslations("bank");
  const section = data.sections.find((item) => item.kind === "summary");
  const [focusVersionId, setFocusVersionId] = useState<string>();
  const address = { kind: "summary" as const };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="space-y-1">
        <Label htmlFor="summary-title">{t("sectionTitle")}</Label>
        <Input
          id="summary-title"
          value={section?.title ?? ""}
          onChange={(event) =>
            onEdit(renameSection(data, "summary", event.target.value))
          }
        />
      </div>
      <VersionList
        dndId="summary-versions"
        slot={data.summary}
        bullet={false}
        focusVersionId={focusVersionId}
        onText={(versionId, text) =>
          onEdit(updateVersionText(data, address, versionId, text))
        }
        onLabel={(versionId, label) =>
          onEdit(renameVersion(data, address, versionId, label))
        }
        onDefault={(versionId) =>
          onEdit(setDefaultVersion(data, address, versionId))
        }
        onReorder={(activeId, overId) =>
          onEdit(reorderVersions(data, address, activeId, overId), "reordered")
        }
        onAdd={(afterVersionId) => {
          const added = addVersion(data, address, afterVersionId);
          setFocusVersionId(added.versionId);
          onEdit(added.data);
        }}
        onRemove={(versionId) =>
          onEdit(removeVersion(data, address, versionId), "deleted")
        }
      />
    </div>
  );
}
