"use client";

import { markdownLineHint } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Input } from "@winnow/ui/components/input";
import { Textarea } from "@winnow/ui/components/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { MarkdownPreview } from "./markdown-preview";

function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
) {
  const selected = value.slice(start, end) || "text";
  const next =
    value.slice(0, start) + before + selected + after + value.slice(end);
  const selectionStart = start + before.length;
  return {
    next,
    selectionStart,
    selectionEnd: selectionStart + selected.length,
  };
}

export function VersionField({
  id,
  label,
  text,
  isDefault,
  autoFocus,
  bullet,
  onLabel,
  onText,
  onNewVersion,
  onNewBullet,
}: {
  id: string;
  label: string;
  text: string;
  isDefault: boolean;
  autoFocus?: boolean;
  bullet: boolean;
  onLabel: (label: string) => void;
  onText: (text: string) => void;
  onNewVersion: () => void;
  onNewBullet?: () => void;
}) {
  const t = useTranslations("bank");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const hint = markdownLineHint(text);

  function applyWrap(before: string, after: string) {
    const field = document.getElementById(`version-${id}`);
    if (!(field instanceof HTMLTextAreaElement)) return;
    const wrapped = wrapSelection(
      text,
      field.selectionStart,
      field.selectionEnd,
      before,
      after,
    );
    onText(wrapped.next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(wrapped.selectionStart, wrapped.selectionEnd);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label={t("versionLabel")}
          className="h-7 max-w-48 text-xs"
          value={label}
          onChange={(event) => onLabel(event.target.value)}
        />
        {isDefault ? (
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {t("defaultVersion")}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => applyWrap("**", "**")}
        >
          {t("bold")}
        </Button>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => setLinkOpen((open) => !open)}
        >
          {t("link")}
        </Button>
      </div>
      {linkOpen ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyWrap("[", `](${linkUrl.trim()})`);
            setLinkOpen(false);
            setLinkUrl("https://");
          }}
        >
          <Input
            aria-label={t("linkUrl")}
            className="h-7 max-w-xs text-xs"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
          />
          <Button type="submit" size="xs">
            {t("applyLink")}
          </Button>
        </form>
      ) : null}
      <Textarea
        id={`version-${id}`}
        autoFocus={autoFocus}
        rows={4}
        value={text}
        onChange={(event) => onText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          if (event.metaKey || event.ctrlKey) {
            if (!bullet || !onNewBullet) return;
            event.preventDefault();
            onNewBullet();
            return;
          }
          if (!event.shiftKey) {
            event.preventDefault();
            onNewVersion();
          }
        }}
      />
      <p className="text-[11px] text-muted-foreground">
        {t("lengthHint", { characters: hint.characters, lines: hint.lines })}
      </p>
      <MarkdownPreview text={text} />
    </div>
  );
}
