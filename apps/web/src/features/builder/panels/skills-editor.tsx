"use client";

import { Button } from "@winnow/ui/components/button";
import { Checkbox } from "@winnow/ui/components/checkbox";
import { Input } from "@winnow/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@winnow/ui/components/select";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useBuilderStore } from "../store/builder-store";
import { SectionHeading } from "./section-heading";

const unassignedValue = "__none__";

export function SkillsEditor({ title }: { title: string }) {
  const t = useTranslations("builder");
  const [newCategory, setNewCategory] = useState("");
  const selections = useBuilderStore((state) => state.selections);
  const addCategory = useBuilderStore((state) => state.addCategory);
  const removeCategory = useBuilderStore((state) => state.removeCategory);
  const renameCategory = useBuilderStore((state) => state.renameCategory);

  const unassigned = selections.skillList.filter(
    (skill) => !selections.skillCategoryId[skill.id],
  );

  const commitCategory = () => {
    addCategory(newCategory);
    setNewCategory("");
  };

  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="mb-3 space-y-1.5">
        {selections.categoryList.map((category) => (
          <div key={category.id} className="flex items-center gap-1">
            <Input
              value={category.label}
              onChange={(event) =>
                renameCategory(category.id, event.target.value)
              }
              aria-label={t("skillCategories")}
              className="h-7 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-destructive"
              onClick={() => removeCategory(category.id)}
            >
              {t("remove")}
            </Button>
          </div>
        ))}
      </div>
      <div className="mb-5 flex items-center gap-1">
        <Input
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder={t("newCategory")}
          aria-label={t("newCategory")}
          className="h-7 text-xs"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitCategory();
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={commitCategory}
        >
          {t("add")}
        </Button>
      </div>

      <SectionHeading>{t("skills")}</SectionHeading>
      {selections.categoryList.map((category) => {
        const skills = selections.skillList.filter(
          (skill) => selections.skillCategoryId[skill.id] === category.id,
        );
        if (skills.length === 0) return null;
        return (
          <div key={category.id} className="mb-3">
            <div className="mb-1 text-xs font-medium">
              {category.label || t("untitled")}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1">
              {skills.map((skill) => (
                <SkillRow key={skill.id} skillId={skill.id} name={skill.name} />
              ))}
            </div>
          </div>
        );
      })}
      {unassigned.length > 0 ? (
        <div className="mb-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {t("unassigned")}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1">
            {unassigned.map((skill) => (
              <SkillRow key={skill.id} skillId={skill.id} name={skill.name} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SkillRow({ skillId, name }: { skillId: string; name: string }) {
  const t = useTranslations("builder");
  const enabled = useBuilderStore(
    (state) => state.selections.enabledSkills[skillId] ?? false,
  );
  const categoryId = useBuilderStore(
    (state) => state.selections.skillCategoryId[skillId] ?? "",
  );
  const categories = useBuilderStore((state) => state.selections.categoryList);
  const toggleSkill = useBuilderStore((state) => state.toggleSkill);
  const assignSkill = useBuilderStore((state) => state.assignSkill);

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Checkbox
        checked={enabled}
        onCheckedChange={() => toggleSkill(skillId)}
        aria-label={name}
      />
      <span
        className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
        title={name}
      >
        {name}
      </span>
      <Select
        value={categoryId || unassignedValue}
        onValueChange={(value) => {
          if (!value) return;
          assignSkill(skillId, value === unassignedValue ? null : value);
        }}
      >
        <SelectTrigger
          size="sm"
          className="h-6 max-w-16 px-1 text-[10px]"
          aria-label={t("assignCategory")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={unassignedValue}>{t("none")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label || t("untitled")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
