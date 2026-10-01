"use client";

import type { PersonalInfo, ResumeData } from "@winnow/core";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";

import { updatePersonal } from "./document";

const fields: (keyof PersonalInfo)[] = [
  "name",
  "title",
  "phone",
  "email",
  "linkedin",
  "github",
];

export function PersonalEditor({
  data,
  onEdit,
}: {
  data: ResumeData;
  onEdit: (next: ResumeData) => void;
}) {
  const t = useTranslations("bank");
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <h2 className="text-sm font-medium">{t("personal")}</h2>
      {fields.map((key) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={`personal-${key}`}>
            {t(key === "title" ? "headline" : key)}
          </Label>
          <Input
            id={`personal-${key}`}
            type={key === "email" ? "email" : "text"}
            value={data.personalInfo[key]}
            onChange={(event) =>
              onEdit(updatePersonal(data, key, event.target.value))
            }
          />
        </div>
      ))}
    </div>
  );
}
