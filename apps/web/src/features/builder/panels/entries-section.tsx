"use client";

import type { ResumeSection } from "@winnow/core";
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

type EntriesSectionData = Extract<ResumeSection, { kind: "entries" }>;

export function EntriesSection({ section }: { section: EntriesSectionData }) {
  const bank = useBuilderStore((state) => state.bank);
  const experienceTitles = useBuilderStore(
    (state) => state.selections.experienceTitles,
  );
  const enabledBullets = useBuilderStore(
    (state) => state.selections.enabledBullets,
  );
  const enabledHighlights = useBuilderStore(
    (state) => state.selections.enabledHighlights,
  );
  const selectedVersionById = useBuilderStore(
    (state) => state.selections.selectedVersionById,
  );
  const bulletMatches = useBuilderStore((state) => state.bulletMatches);
  const highlightMatches = useBuilderStore((state) => state.highlightMatches);
  const setExperienceTitle = useBuilderStore(
    (state) => state.setExperienceTitle,
  );
  const toggleBullet = useBuilderStore((state) => state.toggleBullet);
  const toggleHighlight = useBuilderStore((state) => state.toggleHighlight);
  const setVersion = useBuilderStore((state) => state.setVersion);

  if (!bank) return null;

  return (
    <section>
      <SectionHeading>{section.title}</SectionHeading>
      {section.entries.map((entry) => {
        if (entry.bullets?.length) {
          const titles = [
            entry.title,
            ...(entry.alternativeTitles ?? []),
          ].filter((title): title is string => Boolean(title));
          const selectedTitle = experienceTitles[entry.id] ?? entry.title ?? "";
          return (
            <div key={entry.id} className="mb-4">
              {entry.organization ? (
                <div className="mb-1 text-sm font-medium">
                  {entry.organization}
                </div>
              ) : null}
              {titles.length > 0 ? (
                <Select
                  value={selectedTitle}
                  onValueChange={(value) => {
                    if (value) setExperienceTitle(entry.id, value);
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
              ) : null}
              {entry.period ? (
                <p className="mb-2 text-xs text-muted-foreground">
                  {entry.period}
                </p>
              ) : null}
              {entry.bullets.map((bullet) => (
                <VersionedSlot
                  key={bullet.id}
                  slot={bullet}
                  enabled={enabledBullets[bullet.id] ?? true}
                  selectedVersionId={selectedVersionById[bullet.id]}
                  match={bulletMatches[bullet.id]}
                  onToggle={() => toggleBullet(bullet.id)}
                  onSelectVersion={(versionId) =>
                    setVersion(bullet.id, versionId)
                  }
                />
              ))}
            </div>
          );
        }

        if (entry.versions?.length) {
          return (
            <VersionedSlot
              key={entry.id}
              slot={{
                id: entry.id,
                defaultChecked: entry.defaultChecked,
                versions: entry.versions,
              }}
              enabled={enabledHighlights[entry.id] ?? true}
              selectedVersionId={selectedVersionById[entry.id]}
              match={highlightMatches[entry.id]}
              onToggle={() => toggleHighlight(entry.id)}
              onSelectVersion={(versionId) => setVersion(entry.id, versionId)}
            />
          );
        }

        const role = [entry.title, entry.period].filter(Boolean).join(" · ");
        return (
          <div key={entry.id} className="mb-3">
            {entry.organization ? (
              <div className="text-sm font-medium">{entry.organization}</div>
            ) : null}
            {role ? (
              <p className="text-xs text-muted-foreground">{role}</p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
