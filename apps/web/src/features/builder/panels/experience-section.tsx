"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";
import { VersionedSlot } from "./versioned-slot";

export function ExperienceSection() {
  const t = useTranslations("builder");
  const bank = useBuilderStore((state) => state.bank);
  const experienceTitles = useBuilderStore(
    (state) => state.selections.experienceTitles
  );
  const enabledBullets = useBuilderStore(
    (state) => state.selections.enabledBullets
  );
  const selectedVersionById = useBuilderStore(
    (state) => state.selections.selectedVersionById
  );
  const bulletMatches = useBuilderStore((state) => state.bulletMatches);
  const setExperienceTitle = useBuilderStore((state) => state.setExperienceTitle);
  const toggleBullet = useBuilderStore((state) => state.toggleBullet);
  const setVersion = useBuilderStore((state) => state.setVersion);

  if (!bank) return null;

  return (
    <section>
      <SectionHeading>{t("experience")}</SectionHeading>
      {bank.experience.map((exp) => {
        const titles = [exp.title, ...exp.alternativeTitles];
        const selectedTitle = experienceTitles[exp.id] ?? exp.title;
        return (
          <div key={exp.id} className="mb-4">
            <div className="mb-1 text-sm font-medium">{exp.company}</div>
            <Select
              value={selectedTitle}
              onValueChange={(value) => {
                if (value) setExperienceTitle(exp.id, value);
              }}
            >
              <SelectTrigger className="mb-2 w-full" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {titles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {exp.bullets.map((bullet) => (
              <VersionedSlot
                key={bullet.id}
                slot={bullet}
                enabled={enabledBullets[bullet.id] ?? true}
                selectedVersionId={selectedVersionById[bullet.id]}
                match={bulletMatches[bullet.id]}
                onToggle={() => toggleBullet(bullet.id)}
                onSelectVersion={(versionId) => setVersion(bullet.id, versionId)}
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}
