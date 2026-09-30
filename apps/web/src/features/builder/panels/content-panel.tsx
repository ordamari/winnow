"use client";

import { Button } from "@winnow/ui/components/button";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { useTranslations } from "next-intl";

import { useBuilderStore } from "../store/builder-store";
import { EntriesSection } from "./entries-section";
import { PersonalFields } from "./personal-fields";
import { SectionHeading } from "./section-heading";
import { SkillsEditor } from "./skills-editor";
import { SummarySection } from "./summary-section";

export function ContentPanel() {
  const t = useTranslations("builder");
  const selectedTitle = useBuilderStore(
    (state) => state.selections.selectedTitle,
  );
  const setTitle = useBuilderStore((state) => state.setTitle);
  const resetContent = useBuilderStore((state) => state.resetContent);
  const bank = useBuilderStore((state) => state.bank);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="link" size="xs" onClick={resetContent}>
          {t("reset")}
        </Button>
      </div>
      <PersonalFields />
      <section className="space-y-1">
        <SectionHeading>{t("resumeTitle")}</SectionHeading>
        <Label htmlFor="resume-title" className="sr-only">
          {t("resumeTitle")}
        </Label>
        <Input
          id="resume-title"
          value={selectedTitle}
          onChange={(event) => setTitle(event.target.value)}
        />
      </section>
      {bank?.sections.map((section) => {
        if (section.kind === "summary") {
          return <SummarySection key="summary" title={section.title} />;
        }
        if (section.kind === "skills") {
          return <SkillsEditor key="skills" title={section.title} />;
        }
        return <EntriesSection key={section.id} section={section} />;
      })}
    </div>
  );
}
