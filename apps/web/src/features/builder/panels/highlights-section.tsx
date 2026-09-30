"use client";

import { useTranslations } from "next-intl";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";
import { VersionedSlot } from "./versioned-slot";

export function HighlightsSection() {
  const t = useTranslations("builder");
  const bank = useBuilderStore((state) => state.bank);
  const enabledHighlights = useBuilderStore(
    (state) => state.selections.enabledHighlights,
  );
  const selectedVersionById = useBuilderStore(
    (state) => state.selections.selectedVersionById,
  );
  const highlightMatches = useBuilderStore((state) => state.highlightMatches);
  const toggleHighlight = useBuilderStore((state) => state.toggleHighlight);
  const setVersion = useBuilderStore((state) => state.setVersion);

  if (!bank) return null;

  return (
    <section>
      <SectionHeading>{t("highlights")}</SectionHeading>
      {bank.technicalHighlights.map((highlight) => (
        <VersionedSlot
          key={highlight.id}
          slot={highlight}
          enabled={enabledHighlights[highlight.id] ?? true}
          selectedVersionId={selectedVersionById[highlight.id]}
          match={highlightMatches[highlight.id]}
          onToggle={() => toggleHighlight(highlight.id)}
          onSelectVersion={(versionId) => setVersion(highlight.id, versionId)}
        />
      ))}
    </section>
  );
}
