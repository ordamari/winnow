"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
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
import type { ResumeData, SectionEntry } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { cn } from "cn";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  addEntriesSection,
  addEntry,
  type EditorSelection,
  removeSection,
  reorderEntries,
  reorderSections,
  sectionKey,
} from "./document";

function entryLabel(entry: SectionEntry, untitled: string) {
  return entry.organization || entry.title || untitled;
}

function EntryRow({
  entry,
  selected,
  untitled,
  onSelect,
}: {
  entry: SectionEntry;
  selected: boolean;
  untitled: string;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: entry.id });
  const t = useTranslations("bank");
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-1"
    >
      <button
        type="button"
        className="inline-flex size-6 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label={t("reorder")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3" />
      </button>
      <button
        type="button"
        className={cn(
          "min-w-0 flex-1 truncate rounded-md px-2 py-1 text-start text-xs",
          selected ? "bg-primary/10 text-foreground" : "hover:bg-muted",
        )}
        onClick={onSelect}
      >
        {entryLabel(entry, untitled)}
      </button>
    </div>
  );
}

function EntryGroup({
  data,
  sectionId,
  entries,
  selection,
  onSelect,
  onEdit,
}: {
  data: ResumeData;
  sectionId: string;
  entries: SectionEntry[];
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
}) {
  const t = useTranslations("bank");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onEdit(
      reorderEntries(data, sectionId, String(active.id), String(over.id)),
      "reordered",
    );
  }

  return (
    <DndContext
      id={`section-entries-${sectionId}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={entries.map((entry) => entry.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5 ps-2">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              untitled={t("untitled")}
              selected={
                selection.type === "entry" &&
                selection.sectionId === sectionId &&
                selection.entryId === entry.id
              }
              onSelect={() =>
                onSelect({ type: "entry", sectionId, entryId: entry.id })
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function SectionRail({
  data,
  selection,
  onSelect,
  onEdit,
}: {
  data: ResumeData;
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
}) {
  const t = useTranslations("bank");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const keys = data.sections.map(sectionKey);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onEdit(
      reorderSections(data, String(active.id), String(over.id)),
      "reordered",
    );
  }

  return (
    <nav aria-label={t("sectionsLabel")} className="flex flex-col gap-2">
      <button
        type="button"
        className={cn(
          "rounded-lg px-3 py-2 text-start text-sm",
          selection.type === "personal"
            ? "bg-primary/10 font-medium"
            : "hover:bg-muted",
        )}
        onClick={() => onSelect({ type: "personal" })}
      >
        {t("personal")}
      </button>
      <DndContext
        id="bank-sections"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={keys} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {data.sections.map((section) => (
              <SectionBlock
                key={sectionKey(section)}
                data={data}
                sectionKeyValue={sectionKey(section)}
                title={section.title}
                entries={section.kind === "entries" ? section.entries : null}
                selection={selection}
                onSelect={onSelect}
                onEdit={onEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const added = addEntriesSection(data, t("newSection"));
          onSelect(added.selection);
          onEdit(added.data);
        }}
      >
        <Plus />
        {t("addSection")}
      </Button>
    </nav>
  );
}

function SectionBlock({
  data,
  sectionKeyValue,
  title,
  entries,
  selection,
  onSelect,
  onEdit,
}: {
  data: ResumeData;
  sectionKeyValue: string;
  title: string;
  entries: SectionEntry[] | null;
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  onEdit: (next: ResumeData, undo?: "deleted" | "reordered") => void;
}) {
  const t = useTranslations("bank");
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sectionKeyValue });
  const selected =
    (sectionKeyValue === "summary" && selection.type === "summary") ||
    (sectionKeyValue === "skills" && selection.type === "skills") ||
    (selection.type === "entry" && selection.sectionId === sectionKeyValue);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-lg border bg-card p-1"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label={t("reorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <button
          type="button"
          className={cn(
            "min-w-0 flex-1 truncate rounded-md px-2 py-1 text-start text-sm",
            selected ? "font-medium" : "hover:bg-muted",
          )}
          onClick={() => {
            if (sectionKeyValue === "summary") onSelect({ type: "summary" });
            else if (sectionKeyValue === "skills") onSelect({ type: "skills" });
            else if (entries?.[0]) {
              onSelect({
                type: "entry",
                sectionId: sectionKeyValue,
                entryId: entries[0].id,
              });
            }
          }}
        >
          {title}
        </button>
        {entries ? (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={t("deleteSection")}
            onClick={() => {
              if (
                selection.type === "entry" &&
                selection.sectionId === sectionKeyValue
              ) {
                onSelect({ type: "personal" });
              }
              onEdit(removeSection(data, sectionKeyValue), "deleted");
            }}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
      {entries ? (
        <>
          <EntryGroup
            data={data}
            sectionId={sectionKeyValue}
            entries={entries}
            selection={selection}
            onSelect={onSelect}
            onEdit={onEdit}
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="mt-1 w-full justify-start"
            onClick={() => {
              const added = addEntry(data, sectionKeyValue);
              if (!added) return;
              onSelect({
                type: "entry",
                sectionId: sectionKeyValue,
                entryId: added.entryId,
              });
              onEdit(added.data);
            }}
          >
            <Plus />
            {t("addEntry")}
          </Button>
        </>
      ) : null}
    </div>
  );
}
