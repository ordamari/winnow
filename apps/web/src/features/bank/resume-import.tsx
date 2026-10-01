"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  combineImportSource,
  importFlags,
  type ResumeData,
} from "@winnow/core";
import { Button } from "@winnow/ui/components/button";
import { ErrorState } from "@winnow/ui/components/error-state";
import { Label } from "@winnow/ui/components/label";
import { PageHeader } from "@winnow/ui/components/page-header";
import { Textarea } from "@winnow/ui/components/textarea";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useBankUserId } from "@/components/query-provider";
import { useRouter } from "@/i18n/navigation";
import { acceptResumeImportAction } from "@/server/bank/actions";

import { bankQueryKey } from "./bank-query";
import { ResumeImportReview } from "./resume-import-review";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_CHARS = 60_000;

const ERROR_KEYS = {
  "no-text": "noText",
  "too-large": "tooLarge",
  "too-many-pages": "tooManyPages",
  "too-many-files": "tooManyFiles",
  "rate-limited": "rateLimited",
  "missing-key": "missingKey",
  "invalid-pdf": "invalidPdf",
  "invalid-input": "importFailed",
  "no-result": "importFailed",
  unauthorized: "importFailed",
  unknown: "importFailed",
} as const;

export function ResumeImport({
  existing,
  expectedUpdatedAt,
  onCancel,
}: {
  existing: ResumeData | null;
  expectedUpdatedAt: string | null;
  onCancel: () => void;
}) {
  const t = useTranslations("bank");
  const router = useRouter();
  const userId = useBankUserId();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState<string | null>(null);
  const [draft, setDraft] = useState<ResumeData | null>(null);

  const flags = useMemo(
    () =>
      draft && sourceText
        ? importFlags(combineImportSource(sourceText, existing), draft)
        : [],
    [draft, existing, sourceText],
  );

  function resetDraft() {
    setSourceText(null);
    setDraft(null);
    setError(null);
  }

  async function onRead() {
    if (files.length > MAX_FILES) {
      setError(t("tooManyFiles"));
      return;
    }
    if (
      files.some((file) => file.size > MAX_FILE_BYTES) ||
      text.length > MAX_TEXT_CHARS
    ) {
      setError(t("tooLarge"));
      return;
    }
    if (files.length === 0 && !text.trim()) return;

    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("text", text);
    for (const file of files) body.append("file", file);

    let response: Response;
    try {
      response = await fetch("/api/resume-import", { method: "POST", body });
    } catch {
      setPending(false);
      setError(t("importFailed"));
      return;
    }

    if (!response.ok) {
      setPending(false);
      let code = "unknown";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) code = payload.error;
      } catch {
        code = "unknown";
      }
      const key = ERROR_KEYS[code as keyof typeof ERROR_KEYS] ?? "importFailed";
      setError(t(key));
      return;
    }

    const payload = (await response.json()) as {
      sourceText: string;
      draft: ResumeData;
    };
    setPending(false);
    setSourceText(payload.sourceText);
    setDraft(payload.draft);
  }

  async function onAccept() {
    if (!draft || !sourceText || flags.length > 0) return;
    setPending(true);
    setError(null);
    const result = await acceptResumeImportAction(
      draft,
      sourceText,
      expectedUpdatedAt,
    );
    setPending(false);
    if (!result.ok) {
      setError(
        t(
          result.reason === "conflict"
            ? "conflict"
            : result.reason === "expired"
              ? "expired"
              : result.reason === "flagged"
                ? "notInSource"
                : "importFailed",
        ),
      );
      return;
    }
    queryClient.setQueryData(bankQueryKey(userId), {
      data: result.data,
      updatedAt: result.updatedAt,
    });
    router.refresh();
    onCancel();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader
        title={t("importResume")}
        description={t("importResumeDescription")}
        actions={
          draft && sourceText ? (
            <>
              {flags.length > 0 ? (
                <span className="text-xs text-destructive">
                  {t("flagCount", { count: flags.length })}
                </span>
              ) : null}
              <Button type="button" variant="outline" onClick={resetDraft}>
                {t("startOver")}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button
                type="button"
                disabled={pending || flags.length > 0}
                onClick={onAccept}
              >
                {pending ? t("accepting") : t("acceptImport")}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("cancel")}
            </Button>
          )
        }
      />

      {error ? (
        <ErrorState
          title={error}
          description={t("importResumeDescription")}
          retryLabel={t("startOver")}
          onRetry={() => setError(null)}
        />
      ) : null}

      {draft && sourceText ? (
        <ResumeImportReview
          sourceText={sourceText}
          draft={draft}
          flags={flags}
          onChange={setDraft}
        />
      ) : (
        <form
          className="flex max-w-xl flex-col gap-4"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            void onRead();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="resume-pdf">{t("uploadPdf")}</Label>
            <input
              id="resume-pdf"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="block text-sm"
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
            />
            <p className="text-xs text-muted-foreground">
              {t("uploadPdfHint")}
            </p>
            {files.length > 0 ? (
              <ul className="text-sm text-muted-foreground">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>{file.name}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-paste">{t("pasteResume")}</Label>
            <Textarea
              id="resume-paste"
              rows={12}
              value={text}
              placeholder={t("pasteResumePlaceholder")}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={pending || (files.length === 0 && !text.trim())}
          >
            {pending ? t("reading") : t("readResume")}
          </Button>
          {pending ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("reading")}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
