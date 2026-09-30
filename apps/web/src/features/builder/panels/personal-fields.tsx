"use client";

import type { PersonalInfo } from "@winnow/core";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";

const fields: {
  key: keyof PersonalInfo;
  type?: string;
  label: "name" | "phone" | "email" | "linkedin" | "github";
}[] = [
  { key: "name", label: "name" },
  { key: "phone", label: "phone" },
  { key: "email", label: "email", type: "email" },
  { key: "linkedin", label: "linkedin" },
  { key: "github", label: "github" },
];

export function PersonalFields() {
  const t = useTranslations("builder");
  const personalInfo = useBuilderStore((state) => state.personalInfo);
  const updatePersonalInfo = useBuilderStore(
    (state) => state.updatePersonalInfo,
  );

  return (
    <section>
      <SectionHeading>{t("details")}</SectionHeading>
      <div className="space-y-2">
        {fields.map(({ key, label, type }) => (
          <div key={key} className="space-y-1">
            <Label
              htmlFor={`personal-${key}`}
              className="text-xs text-muted-foreground"
            >
              {t(label)}
            </Label>
            <Input
              id={`personal-${key}`}
              type={type ?? "text"}
              value={personalInfo[key]}
              onChange={(event) => updatePersonalInfo(key, event.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
