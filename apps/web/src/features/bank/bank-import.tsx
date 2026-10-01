"use client";

import { useQueryClient } from "@tanstack/react-query";
import { parseResumeData, summarizeResume } from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { Label } from "@winnow/ui/components/label";
import { Textarea } from "@winnow/ui/components/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useBankUserId } from "@/components/query-provider";
import { useRouter } from "@/i18n/navigation";
import { importBankAction } from "@/server/bank/actions";

import { bankQueryKey } from "./bank-query";

export function BankImport({ onImported }: { onImported?: () => void }) {
  const t = useTranslations("bank");
  const router = useRouter();
  const userId = useBankUserId();
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<{
    jobs: number;
    bullets: number;
    sections: number;
    sectionTitles: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function readPreview(text: string) {
    setRaw(text);
    if (!text.trim()) {
      setPreview(null);
      setError(null);
      return;
    }
    try {
      const data = parseResumeData(JSON.parse(text) as unknown);
      setPreview(summarizeResume(data));
      setError(null);
    } catch {
      setPreview(null);
      setError(t("invalid"));
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    readPreview(await file.text());
  }

  async function onImport() {
    if (!preview) return;
    setPending(true);
    setError(null);
    const result = await importBankAction(raw);
    setPending(false);
    if (!result.ok) {
      setError(t("invalid"));
      return;
    }
    queryClient.setQueryData(bankQueryKey(userId), {
      data: result.data,
      updatedAt: result.updatedAt,
    });
    onImported?.();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="space-y-2">
        <Label htmlFor="resume-json">{t("pasteLabel")}</Label>
        <Textarea
          id="resume-json"
          value={raw}
          rows={12}
          placeholder={t("pastePlaceholder")}
          onChange={(event) => readPreview(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resume-file">{t("uploadLabel")}</Label>
        <input
          id="resume-file"
          type="file"
          accept="application/json,.json"
          className="block text-sm"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {preview ? (
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">{t("previewTitle")}</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>{t("jobs", { count: preview.jobs })}</li>
            <li>{t("bullets", { count: preview.bullets })}</li>
            <li>{t("sections", { count: preview.sections })}</li>
          </ul>
          {preview.sectionTitles.length > 0 ? (
            <p className="mt-2 text-sm">{preview.sectionTitles.join(", ")}</p>
          ) : null}
          <Button
            type="button"
            className="mt-4"
            disabled={pending}
            onClick={onImport}
          >
            {pending ? t("importing") : t("import")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
