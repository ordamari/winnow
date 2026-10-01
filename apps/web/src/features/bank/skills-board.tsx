"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ResumeData } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Input } from "@winnow/ui/components/input";
import { Label } from "@winnow/ui/components/label";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  addCategory,
  addSkill,
  placeSkill,
  removeCategory,
  removeSkill,
  renameCategory,
  renameSection,
  renameSkill,
} from "./document";

const NONE = "none";

function columnId(categoryId: string | null) {
  return `column:${categoryId ?? NONE}`;
}

function SkillCard({
  id,
  name,
  onRename,
  onRemove,
}: {
  id: string;
  name: string;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("bank");
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-1 rounded-lg border bg-background p-1"
    >
      <button
        type="button"
        className="inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label={t("reorder")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <Input
        aria-label={t("skillName")}
        className="h-7"
        value={name}
        placeholder={t("newSkill")}
        onChange={(event) => onRename(event.target.value)}
      />
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={t("delete")}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function SkillColumn({
  id,
  title,
  skillIds,
  onTitle,
  onRemove,
  onAdd,
  children,
}: {
  id: string;
  title: string;
  skillIds: string[];
  onTitle?: (title: string) => void;
  onRemove?: () => void;
  onAdd: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("bank");
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className={`flex min-w-56 flex-1 flex-col gap-2 rounded-xl border p-3 ${isOver ? "border-primary" : "border-border"}`}
    >
      {onTitle ? (
        <Input
          aria-label={t("categoryName")}
          className="h-7 font-medium"
          value={title}
          onChange={(event) => onTitle(event.target.value)}
        />
      ) : (
        <h3 className="px-1 text-xs font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-16 flex-col gap-2">{children}</div>
      </SortableContext>
      <div className="flex gap-1">
        <Button type="button" size="xs" variant="outline" onClick={onAdd}>
          {t("addSkill")}
        </Button>
        {onRemove ? (
          <Button type="button" size="xs" variant="ghost" onClick={onRemove}>
            {t("delete")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function SkillsBoard({
  data,
  onEdit,
}: {
  data: ResumeData;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
}) {
  const t = useTranslations("bank");
  const section = data.sections.find((item) => item.kind === "skills");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns: { id: string | null; title: string }[] = [
    ...data.skillCategories.map((category) => ({
      id: category.id,
      title: category.label,
    })),
    { id: null, title: t("uncategorized") },
  ];

  function skillsIn(categoryId: string | null) {
    return data.skills.filter(
      (skill) => (skill.defaultCategoryId ?? null) === categoryId,
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const skillId = String(active.id);
    const overId = String(over.id);
    const skill = data.skills.find((item) => item.id === skillId);
    if (!skill) return;
    if (overId.startsWith("column:")) {
      const raw = overId.slice("column:".length);
      const categoryId = raw === NONE ? null : raw;
      onEdit(placeSkill(data, skillId, categoryId, null), "reordered");
      return;
    }
    const target = data.skills.find((item) => item.id === overId);
    if (!target) return;
    onEdit(
      placeSkill(data, skillId, target.defaultCategoryId ?? null, target.id),
      "reordered",
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label htmlFor="skills-title">{t("sectionTitle")}</Label>
        <Input
          id="skills-title"
          className="max-w-sm"
          value={section?.title ?? ""}
          onChange={(event) =>
            onEdit(renameSection(data, "skills", event.target.value))
          }
        />
      </div>
      <DndContext
        id="bank-skills"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => {
            const skills = skillsIn(column.id);
            return (
              <SkillColumn
                key={column.id ?? NONE}
                id={columnId(column.id)}
                title={column.title}
                skillIds={skills.map((skill) => skill.id)}
                onTitle={
                  column.id
                    ? (title) => onEdit(renameCategory(data, column.id!, title))
                    : undefined
                }
                onRemove={
                  column.id
                    ? () => onEdit(removeCategory(data, column.id!), "deleted")
                    : undefined
                }
                onAdd={() => onEdit(addSkill(data, column.id).data)}
              >
                {skills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    id={skill.id}
                    name={skill.name}
                    onRename={(name) =>
                      onEdit(renameSkill(data, skill.id, name))
                    }
                    onRemove={() =>
                      onEdit(removeSkill(data, skill.id), "deleted")
                    }
                  />
                ))}
              </SkillColumn>
            );
          })}
        </div>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => onEdit(addCategory(data, t("newCategory")).data)}
      >
        {t("addCategory")}
      </Button>
    </div>
  );
}
