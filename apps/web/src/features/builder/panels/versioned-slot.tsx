"use client";

import type { BulletMatch, TextVersion, VersionedText } from "@winnow/core";
import { Checkbox } from "@winnow/ui/components/checkbox";
import { Label } from "@winnow/ui/components/label";
import { MatchPercent } from "@winnow/ui/components/match-percent";
import { cn } from "cn";
import { useTranslations } from "next-intl";

function plainText(text: string) {
  return text.replace(/\*\*/g, "");
}

function VersionChoice({
  name,
  version,
  selected,
  onSelect,
}: {
  name: string;
  version: TextVersion;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-lg border p-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-ring",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        className="mt-0.5 accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {version.label}
        </span>
        <span className="text-xs leading-tight text-muted-foreground">
          {plainText(version.text)}
        </span>
      </span>
    </label>
  );
}

export function VersionedSlot({
  slot,
  enabled,
  selectedVersionId,
  match,
  onToggle,
  onSelectVersion,
}: {
  slot: VersionedText;
  enabled: boolean;
  selectedVersionId: string | undefined;
  match?: BulletMatch;
  onToggle: () => void;
  onSelectVersion: (versionId: string) => void;
}) {
  const t = useTranslations("builder");
  const matchLabel = t("match");

  if (slot.versions.length < 2) {
    const text = plainText(slot.versions[0]?.text ?? "");
    return (
      <div className="mb-1.5 flex items-start gap-2">
        <Checkbox
          id={`include-${slot.id}`}
          checked={enabled}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <Label
          htmlFor={`include-${slot.id}`}
          className="min-w-0 flex-1 items-start font-normal"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs leading-tight text-muted-foreground">
              {text}
            </span>
            {match ? (
              <MatchPercent
                value={match.matchPercent}
                reason={match.reason}
                matchLabel={matchLabel}
              />
            ) : null}
          </span>
        </Label>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-start gap-2">
        <Checkbox
          id={`include-${slot.id}`}
          checked={enabled}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <Label
          htmlFor={`include-${slot.id}`}
          className="min-w-0 flex-1 cursor-pointer items-start font-normal"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-medium">{t("showOnResume")}</span>
              {match ? (
                <MatchPercent
                  value={match.matchPercent}
                  matchLabel={matchLabel}
                />
              ) : null}
            </span>
            {match?.reason ? (
              <span className="text-[10px] leading-snug text-muted-foreground">
                {match.reason}
              </span>
            ) : null}
          </span>
        </Label>
      </div>
      <div className="ms-6 space-y-1.5">
        {slot.versions.map((version) => (
          <VersionChoice
            key={version.id}
            name={`version-${slot.id}`}
            version={version}
            selected={selectedVersionId === version.id}
            onSelect={() => onSelectVersion(version.id)}
          />
        ))}
      </div>
    </div>
  );
}
