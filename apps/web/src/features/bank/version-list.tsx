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
import type { TextVersion, VersionedText } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { cn } from "cn";
import { GripVertical, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { VersionField } from "./version-field";

function SortableVersion({
  id,
  handleLabel,
  children,
}: {
  id: string;
  handleLabel: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex gap-1 rounded-lg border bg-card p-3"
    >
      <button
        type="button"
        className="mt-1 inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label={handleLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function VersionList({
  dndId,
  slot,
  bullet,
  focusVersionId,
  onText,
  onLabel,
  onDefault,
  onReorder,
  onAdd,
  onRemove,
  onNewBullet,
}: {
  dndId: string;
  slot: VersionedText;
  bullet: boolean;
  focusVersionId?: string;
  onText: (versionId: string, text: string) => void;
  onLabel: (versionId: string, label: string) => void;
  onDefault: (versionId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAdd: (afterVersionId: string) => void;
  onRemove: (versionId: string) => void;
  onNewBullet?: (bulletId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={slot.versions.map((version) => version.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {slot.versions.map((version) => (
            <VersionRow
              key={version.id}
              version={version}
              bullet={bullet}
              focusVersionId={focusVersionId}
              canDelete={slot.versions.length > 1}
              onText={onText}
              onLabel={onLabel}
              onDefault={onDefault}
              onAdd={onAdd}
              onRemove={onRemove}
              onNewBullet={onNewBullet ? () => onNewBullet(slot.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function VersionRow({
  version,
  bullet,
  focusVersionId,
  canDelete,
  onText,
  onLabel,
  onDefault,
  onAdd,
  onRemove,
  onNewBullet,
}: {
  version: TextVersion;
  bullet: boolean;
  focusVersionId?: string;
  canDelete: boolean;
  onText: (versionId: string, text: string) => void;
  onLabel: (versionId: string, label: string) => void;
  onDefault: (versionId: string) => void;
  onAdd: (afterVersionId: string) => void;
  onRemove: (versionId: string) => void;
  onNewBullet?: () => void;
}) {
  const t = useTranslations("bank");
  return (
    <SortableVersion id={version.id} handleLabel={t("reorder")}>
      <div className="space-y-2">
        <VersionField
          id={version.id}
          label={version.label}
          text={version.text}
          isDefault={version.defaultSelected === true}
          autoFocus={focusVersionId === version.id}
          bullet={bullet}
          onLabel={(label) => onLabel(version.id, label)}
          onText={(text) => onText(version.id, text)}
          onNewVersion={() => onAdd(version.id)}
          onNewBullet={onNewBullet}
        />
        <div className="flex flex-wrap gap-1">
          {version.defaultSelected ? null : (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => onDefault(version.id)}
            >
              <Star />
              {t("makeDefault")}
            </Button>
          )}
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={!canDelete}
            onClick={() => onRemove(version.id)}
          >
            <Trash2 />
            {t("delete")}
          </Button>
        </div>
      </div>
    </SortableVersion>
  );
}

export function BulletList({
  dndId,
  bullets,
  focusVersionId,
  onText,
  onLabel,
  onDefault,
  onReorderVersions,
  onAddVersion,
  onRemoveVersion,
  onReorderBullets,
  onAddBullet,
  onRemoveBullet,
}: {
  dndId: string;
  bullets: VersionedText[];
  focusVersionId?: string;
  onText: (bulletId: string, versionId: string, text: string) => void;
  onLabel: (bulletId: string, versionId: string, label: string) => void;
  onDefault: (bulletId: string, versionId: string) => void;
  onReorderVersions: (
    bulletId: string,
    activeId: string,
    overId: string,
  ) => void;
  onAddVersion: (bulletId: string, afterVersionId: string) => void;
  onRemoveVersion: (bulletId: string, versionId: string) => void;
  onReorderBullets: (activeId: string, overId: string) => void;
  onAddBullet: (afterBulletId: string) => void;
  onRemoveBullet: (bulletId: string) => void;
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
    onReorderBullets(String(active.id), String(over.id));
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={bullets.map((bullet) => bullet.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {bullets.map((bullet, index) => (
            <SortableBullet
              key={bullet.id}
              id={bullet.id}
              handleLabel={t("reorder")}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  {t("bulletNumber", { number: index + 1 })}
                </h3>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => onRemoveBullet(bullet.id)}
                >
                  <Trash2 />
                  {t("delete")}
                </Button>
              </div>
              <VersionList
                dndId={`bullet-versions-${bullet.id}`}
                slot={bullet}
                bullet
                focusVersionId={focusVersionId}
                onText={(versionId, text) => onText(bullet.id, versionId, text)}
                onLabel={(versionId, label) =>
                  onLabel(bullet.id, versionId, label)
                }
                onDefault={(versionId) => onDefault(bullet.id, versionId)}
                onReorder={(activeId, overId) =>
                  onReorderVersions(bullet.id, activeId, overId)
                }
                onAdd={(afterVersionId) =>
                  onAddVersion(bullet.id, afterVersionId)
                }
                onRemove={(versionId) => onRemoveVersion(bullet.id, versionId)}
                onNewBullet={onAddBullet}
              />
            </SortableBullet>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBullet({
  id,
  handleLabel,
  children,
}: {
  id: string;
  handleLabel: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-xl border bg-background p-3")}
    >
      <div className="flex gap-1">
        <button
          type="button"
          className="inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label={handleLabel}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
