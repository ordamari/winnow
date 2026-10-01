"use client";

import {
  alternativeTitleImportPath,
  bulletImportPath,
  categoryImportPath,
  EDUCATION_SECTION_ID,
  entryImportPath,
  entryVersionImportPath,
  EXPERIENCE_SECTION_ID,
  HIGHLIGHTS_SECTION_ID,
  type ImportFlag,
  mergeBulletAsVersion,
  personalImportPath,
  type ResumeData,
  sectionTitleImportPath,
  skillImportPath,
  summaryImportPath,
} from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { Textarea } from "@winnow/ui/components/textarea";
import { useTranslations } from "next-intl";

import {
  removeAlternativeTitle,
  removeBullet,
  removeBulletVersion,
  removeEntryVersion,
  removeSkill,
  removeSummaryVersion,
  setAlternativeTitle,
  setBulletVersionText,
  setCategoryLabel,
  setEntryField,
  setEntryVersionText,
  setPersonalField,
  setSectionTitle,
  setSkillName,
  setSummaryText,
} from "./resume-import-edits";

const STRUCTURAL_SECTION_IDS = new Set([
  EXPERIENCE_SECTION_ID,
  HIGHLIGHTS_SECTION_ID,
  EDUCATION_SECTION_ID,
]);

export function ResumeImportReview({
  sourceText,
  draft,
  flags,
  onChange,
}: {
  sourceText: string;
  draft: ResumeData;
  flags: ImportFlag[];
  onChange: (next: ResumeData) => void;
}) {
  const t = useTranslations("bank");
  const summaryTitle =
    draft.sections.find((section) => section.kind === "summary")?.title ??
    t("summary");
  const skillsTitle =
    draft.sections.find((section) => section.kind === "skills")?.title ??
    t("skills");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="min-h-0 lg:max-h-[calc(100svh-12rem)] lg:overflow-auto">
        <h2 className="text-sm font-medium">{t("source")}</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-xl border bg-card p-4 font-sans text-sm">
          {sourceText}
        </pre>
      </section>
      <section className="flex min-h-0 flex-col gap-6 lg:max-h-[calc(100svh-12rem)] lg:overflow-auto">
        <h2 className="text-sm font-medium">{t("draft")}</h2>
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium">{t("personal")}</h3>
          {(
            [
              ["name", "name"],
              ["title", "headline"],
              ["phone", "phone"],
              ["email", "email"],
              ["linkedin", "linkedin"],
              ["github", "github"],
            ] as const
          ).map(([field, label]) => (
            <TextField
              key={field}
              label={t(label)}
              path={personalImportPath(field)}
              value={draft.personalInfo[field]}
              flags={flags}
              onValue={(value) =>
                onChange(setPersonalField(draft, field, value))
              }
            />
          ))}
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium">{summaryTitle}</h3>
          {draft.summary.versions.map((version, index) => (
            <TextField
              key={version.id}
              label={t("versionNumber", { number: index + 1 })}
              path={summaryImportPath(version.id)}
              value={version.text}
              flags={flags}
              multiline
              onRemove={() => onChange(removeSummaryVersion(draft, version.id))}
              onValue={(value) =>
                onChange(setSummaryText(draft, version.id, value))
              }
            />
          ))}
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium">{skillsTitle}</h3>
          {draft.skillCategories.map((category) => (
            <TextField
              key={category.id}
              label={t("categoryName")}
              path={categoryImportPath(category.id)}
              value={category.label}
              flags={flags}
              onValue={(value) =>
                onChange(setCategoryLabel(draft, category.id, value))
              }
            />
          ))}
          {draft.skills.map((skill) => (
            <TextField
              key={skill.id}
              label={t("skillName")}
              path={skillImportPath(skill.id)}
              value={skill.name}
              flags={flags}
              onRemove={() => onChange(removeSkill(draft, skill.id))}
              onValue={(value) =>
                onChange(setSkillName(draft, skill.id, value))
              }
            />
          ))}
        </div>

        {draft.sections.map((section) => {
          if (section.kind !== "entries") return null;
          const structural = STRUCTURAL_SECTION_IDS.has(section.id);
          return (
            <div
              key={section.id}
              className="space-y-4 rounded-xl border bg-card p-4"
            >
              {structural ? (
                <h3 className="text-sm font-medium">{section.title}</h3>
              ) : (
                <TextField
                  label={t("sectionTitle")}
                  path={sectionTitleImportPath(section.id)}
                  value={section.title}
                  flags={flags}
                  onValue={(value) =>
                    onChange(setSectionTitle(draft, section.id, value))
                  }
                />
              )}
              {section.entries.map((entry) => (
                <div key={entry.id} className="space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">
                    {entry.organization || entry.title || t("untitled")}
                  </p>
                  {(
                    [
                      ["organization", "organization"],
                      ["title", "role"],
                      ["period", "period"],
                      ["url", "url"],
                    ] as const
                  ).map(([field, label]) => (
                    <TextField
                      key={field}
                      label={t(label)}
                      path={entryImportPath(section.id, entry.id, field)}
                      value={entry[field] ?? ""}
                      flags={flags}
                      onValue={(value) =>
                        onChange(
                          setEntryField(
                            draft,
                            section.id,
                            entry.id,
                            field,
                            value,
                          ),
                        )
                      }
                    />
                  ))}
                  {(entry.alternativeTitles ?? []).map((title, index) => (
                    <TextField
                      key={`${entry.id}-alt-${index}`}
                      label={t("alternativeTitles")}
                      path={alternativeTitleImportPath(
                        section.id,
                        entry.id,
                        index,
                      )}
                      value={title}
                      flags={flags}
                      onRemove={() =>
                        onChange(
                          removeAlternativeTitle(
                            draft,
                            section.id,
                            entry.id,
                            index,
                          ),
                        )
                      }
                      onValue={(value) =>
                        onChange(
                          setAlternativeTitle(
                            draft,
                            section.id,
                            entry.id,
                            index,
                            value,
                          ),
                        )
                      }
                    />
                  ))}
                  {(entry.versions ?? []).map((version, index) => (
                    <TextField
                      key={version.id}
                      label={t("versionNumber", { number: index + 1 })}
                      path={entryVersionImportPath(
                        section.id,
                        entry.id,
                        version.id,
                      )}
                      value={version.text}
                      flags={flags}
                      multiline
                      onRemove={() =>
                        onChange(
                          removeEntryVersion(
                            draft,
                            section.id,
                            entry.id,
                            version.id,
                          ),
                        )
                      }
                      onValue={(value) =>
                        onChange(
                          setEntryVersionText(
                            draft,
                            section.id,
                            entry.id,
                            version.id,
                            value,
                          ),
                        )
                      }
                    />
                  ))}
                  {(entry.bullets ?? []).map((bullet, index) => (
                    <div key={bullet.id} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-medium">
                          {t("bulletNumber", { number: index + 1 })}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          {(entry.bullets ?? []).length > 1 ? (
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              {t("addAsVersion")}
                              <select
                                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
                                defaultValue=""
                                onChange={(event) => {
                                  const toId = event.target.value;
                                  if (!toId) return;
                                  onChange(
                                    mergeBulletAsVersion(
                                      draft,
                                      section.id,
                                      entry.id,
                                      bullet.id,
                                      toId,
                                    ),
                                  );
                                  event.target.value = "";
                                }}
                              >
                                <option value="">{t("chooseBullet")}</option>
                                {(entry.bullets ?? [])
                                  .filter((item) => item.id !== bullet.id)
                                  .map((item, itemIndex) => (
                                    <option key={item.id} value={item.id}>
                                      {t("bulletNumber", {
                                        number:
                                          (entry.bullets ?? []).findIndex(
                                            (candidate) =>
                                              candidate.id === item.id,
                                          ) + 1 || itemIndex + 1,
                                      })}
                                    </option>
                                  ))}
                              </select>
                            </label>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onChange(
                                removeBullet(
                                  draft,
                                  section.id,
                                  entry.id,
                                  bullet.id,
                                ),
                              )
                            }
                          >
                            {t("removeItem")}
                          </Button>
                        </div>
                      </div>
                      {bullet.versions.map((version, versionIndex) => (
                        <TextField
                          key={version.id}
                          label={t("versionNumber", {
                            number: versionIndex + 1,
                          })}
                          path={bulletImportPath(
                            section.id,
                            entry.id,
                            bullet.id,
                            version.id,
                          )}
                          value={version.text}
                          flags={flags}
                          multiline
                          onRemove={
                            bullet.versions.length > 1
                              ? () =>
                                  onChange(
                                    removeBulletVersion(
                                      draft,
                                      section.id,
                                      entry.id,
                                      bullet.id,
                                      version.id,
                                    ),
                                  )
                              : undefined
                          }
                          onValue={(value) =>
                            onChange(
                              setBulletVersionText(
                                draft,
                                section.id,
                                entry.id,
                                bullet.id,
                                version.id,
                                value,
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function TextField({
  label,
  path,
  value,
  flags,
  multiline,
  onValue,
  onRemove,
}: {
  label: string;
  path: string;
  value: string;
  flags: ImportFlag[];
  multiline?: boolean;
  onValue: (value: string) => void;
  onRemove?: () => void;
}) {
  const t = useTranslations("bank");
  const id = `import-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const errorId = `${id}-error`;
  const invalid = flags.some((flag) => flag.path === path);
  const field = multiline ? (
    <Textarea
      id={id}
      rows={3}
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      onChange={(event) => onValue(event.target.value)}
    />
  ) : (
    <Input
      id={id}
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      onChange={(event) => onValue(event.target.value)}
    />
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            {t("removeItem")}
          </Button>
        ) : null}
      </div>
      {field}
      {invalid ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {t("notInSource")}
        </p>
      ) : null}
    </div>
  );
}
